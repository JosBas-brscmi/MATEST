import { useEffect, useState } from 'react';

type Row = {
  id: string;
  test_key: string;
  test_type: string;
  candidate_email: string;
  candidate_name: string;
  submitted_at: string;
  score_percent: number;
};

const TOKEN_KEY = 'matta_admin_token';

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [tokenInput, setTokenInput] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadResults(adminToken: string) {
    setLoading(true);
    setErr('');
    try {
      const response = await fetch('/api/admin/results', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
      setRows(data.rows ?? []);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not load results.');
      if (error instanceof Error && error.message.includes('authentication')) {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) void loadResults(token);
  }, []);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextToken = tokenInput.trim();
    if (!nextToken) return;
    sessionStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setTokenInput('');
    void loadResults(nextToken);
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
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
        <a href="/portal" className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5 text-sm">Back</a>
      </div>

      {!token && (
        <form onSubmit={handleLogin} className="mt-6 flex max-w-lg gap-3 rounded-2xl border border-white/10 bg-panel/60 p-5">
          <label className="sr-only" htmlFor="admin-token">Admin token</label>
          <input
            id="admin-token"
            type="password"
            autoComplete="current-password"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="Enter the locally configured admin token"
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-sm outline-none focus:border-emerald-400"
          />
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400">Sign in</button>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-panel/60 p-5 shadow-glow">
        {loading && <div className="text-muted">Loading…</div>}
        {!loading && err && <div role="alert" className="text-sm text-danger">{err}</div>}
        {!loading && token && !err && (
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
      <p className="mt-4 text-xs text-muted">Configure ADMIN_TOKEN on the API host. The token is held in this browser session only.</p>
    </div>
  );
}
