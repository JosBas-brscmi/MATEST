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
};

const PASSWORD_KEY = 'matta_admin_password';

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASSWORD_KEY) || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadResults(adminPassword: string) {
    setLoading(true);
    setErr('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/results`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        sessionStorage.removeItem(PASSWORD_KEY);
        setPassword('');
      }
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
      setRows(data.rows ?? []);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not load results.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) void loadResults(password);
  }, []);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPassword = passwordInput;
    if (!nextPassword) return;
    sessionStorage.setItem(PASSWORD_KEY, nextPassword);
    setPassword(nextPassword);
    setPasswordInput('');
    void loadResults(nextPassword);
  }

  function handleLogout() {
    sessionStorage.removeItem(PASSWORD_KEY);
    setPassword('');
    setRows([]);
    setErr('');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <div className="text-sm text-muted mt-1">Assessment results stored in the local SQLite database.</div>
        </div>
        <Link to="/portal" className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5 text-sm">Back</Link>
      </div>

      {!password && (
        <form onSubmit={handleLogin} className="mt-6 flex max-w-lg gap-3 rounded-2xl border border-white/10 bg-panel/60 p-5">
          <label className="sr-only" htmlFor="admin-password">Admin password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            placeholder="Enter the admin password"
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-sm outline-none focus:border-emerald-400"
          />
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400">Sign in</button>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-panel/60 p-5 shadow-glow">
        {loading && <div className="text-muted">Loading…</div>}
        {!loading && err && <div role="alert" className="text-sm text-danger">{err}</div>}
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
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{new Date(row.submitted_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{row.candidate_name} ({row.candidate_email})</td>
                      <td className="py-2 pr-4">{row.test_type}</td>
                      <td className="py-2 pr-4">{row.score_percent}%</td>
                      <td className="py-2 pr-4 font-mono text-xs text-muted">{row.id}</td>
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
