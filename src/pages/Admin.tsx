import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib';

type Row = {
  id: string;
  test_key: string;
  test_type: string;
  candidate_email: string;
  candidate_name: string;
  submitted_at: string;
  score_percent: number;
  custom_quiz_title: string | null;
};

const PASSWORD_KEY = 'matta_admin_password';

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASSWORD_KEY) || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [err, setErr] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  async function loadResults(adminPassword: string): Promise<boolean> {
    setLoading(true);
    setErr('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/results`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
      setRows(data.rows ?? []);
      setAuthenticated(true);
      return true;
    } catch (error) {
      sessionStorage.removeItem(PASSWORD_KEY);
      setPassword('');
      setRows([]);
      setAuthenticated(false);
      setErr(error instanceof Error ? error.message : 'Could not load results.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) void loadResults(password);
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPassword = passwordInput;
    if (!nextPassword) return;
    if (await loadResults(nextPassword)) {
      sessionStorage.setItem(PASSWORD_KEY, nextPassword);
      setPassword(nextPassword);
      setPasswordInput('');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(PASSWORD_KEY);
    setPassword('');
    setRows([]);
    setErr('');
    setAuthenticated(false);
  }

  async function deleteResult(row: Row) {
    const testName = row.custom_quiz_title || row.test_type;
    if (!window.confirm(
      `Permanently delete this ${testName} result for ${row.candidate_name} (${row.candidate_email})?\n\nThis cannot be undone.`,
    )) return;

    const adminPassword = sessionStorage.getItem(PASSWORD_KEY);
    if (!adminPassword) {
      setDeleteError('Your admin session has expired. Sign in again before deleting results.');
      return;
    }

    setDeletingId(row.id);
    setDeleteError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/results/${encodeURIComponent(row.id)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Could not delete result (${response.status}).`);
      setRows((current) => current.filter((item) => item.id !== row.id));
    } catch (deleteRequestError) {
      setDeleteError(deleteRequestError instanceof Error ? deleteRequestError.message : 'Could not delete result.');
    } finally {
      setDeletingId('');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <div className="text-sm text-muted mt-1">Assessment results stored in the local SQLite database.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {authenticated && (
            <>
              <Link to="/admin/quizzes/new" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400">
                Create Quiz
              </Link>
              <Link to="/admin/quizzes/remove" className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10">
                Remove Quiz
              </Link>
              <Link to="/admin/quizzes/modify" className="rounded-xl border border-sky-500/40 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-500/10">
                Modify Quiz
              </Link>
            </>
          )}
          <Link to="/portal" className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5 text-sm">Back</Link>
        </div>
      </div>

      {!password && (
        <form onSubmit={handleLogin} className="mt-6 flex max-w-lg gap-3 rounded-2xl border border-white/10 bg-panel/60 p-5">
          <label className="sr-only" htmlFor="admin-password">Admin password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            disabled={loading}
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            placeholder="Enter the admin password"
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-sm outline-none focus:border-emerald-400"
          />
          <button disabled={loading} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50">Sign in</button>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-panel/60 p-5 shadow-glow">
        {loading && <div className="text-muted">Loading…</div>}
        {!loading && err && <div role="alert" className="text-sm text-danger">{err}</div>}
        {!loading && authenticated && deleteError && <div role="alert" className="mb-4 text-sm text-danger">{deleteError}</div>}
        {!loading && password && !err && (
          <>
            <div className="mb-4 flex justify-end">
              <button onClick={handleLogout} className="text-sm text-muted underline hover:text-white">Sign out</button>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-muted">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4">Submitted</th>
                    <th className="text-left py-2 pr-4">Candidate</th>
                    <th className="text-left py-2 pr-4">Test</th>
                    <th className="text-left py-2 pr-4">Score</th>
                    <th className="text-left py-2 pr-4">ID</th>
                    <th className="text-left py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{new Date(row.submitted_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{row.candidate_name} ({row.candidate_email})</td>
                      <td className="py-2 pr-4">{row.custom_quiz_title || row.test_type}</td>
                      <td className="py-2 pr-4">{row.score_percent}%</td>
                      <td className="py-2 pr-4 font-mono text-xs text-muted">{row.id}</td>
                      <td className="py-2 pr-4">
                        <button
                          type="button"
                          disabled={Boolean(deletingId)}
                          onClick={() => void deleteResult(row)}
                          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingId === row.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <p className="py-6 text-center text-sm text-muted">No assessment results have been submitted.</p>}
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-xs text-muted">Configure ADMIN_PASSWORD on the API host. The password is held in this browser session only.</p>
    </div>
  );
}
