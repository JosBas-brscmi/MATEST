import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib';

type TestType = 'iq' | 'english' | 'aptitude' | 'custom';
type QuizOption = { id: string; title: string; kind: 'builtin' | 'custom' };

type QuestionStatistic = {
  id: string;
  category: string;
  prompt: string;
  passage: string;
  choices: string[];
  responses: number;
  correct: number;
  incorrect: number;
  accuracyPercent: number | null;
};

type Statistics = {
  testType: TestType;
  quizId?: string;
  quizTitle?: string;
  submissionCount: number;
  questions: QuestionStatistic[];
};

const PASSWORD_KEY = 'matta_admin_password';
const TEST_LABELS: Record<TestType, string> = {
  iq: 'IQ Assessment',
  english: 'English Assessment',
  aptitude: 'Work Aptitude',
  custom: 'Custom Quiz',
};
const MINIMUM_SAMPLE_SIZE = 5;

export default function QuestionStats() {
  const [testType, setTestType] = useState<TestType>('iq');
  const [customQuizzes, setCustomQuizzes] = useState<QuizOption[]>([]);
  const [customQuizId, setCustomQuizId] = useState('');
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASSWORD_KEY) || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  async function loadStatistics(
    adminPassword: string,
    selectedTest: TestType,
    selectedQuizId: string,
  ): Promise<boolean> {
    if (selectedTest === 'custom' && !selectedQuizId) {
      setStatistics(null);
      setError('');
      setLoading(false);
      return false;
    }
    setLoading(true);
    setStatistics(null);
    setError('');
    let responseStatus = 0;
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/question-stats?testType=${encodeURIComponent(selectedTest)}${
          selectedTest === 'custom' ? `&quizId=${encodeURIComponent(selectedQuizId)}` : ''
        }`,
        { headers: { 'X-Admin-Password': adminPassword } },
      );
      responseStatus = response.status;
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
      setStatistics(data);
      setAuthenticated(true);
      return true;
    } catch (requestError) {
      if (responseStatus === 401) {
        sessionStorage.removeItem(PASSWORD_KEY);
        setPassword('');
        setAuthenticated(false);
      }
      setError(requestError instanceof Error ? requestError.message : 'Could not load question statistics.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) void loadStatistics(password, testType, customQuizId);
  }, [password, testType, customQuizId]);

  useEffect(() => {
    if (!password) return;
    fetch(`${API_BASE_URL}/admin/quizzes`, {
      headers: { 'X-Admin-Password': password },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Could not load quizzes (${response.status}).`);
        const quizzes = (data.quizzes ?? []).filter((quiz: QuizOption) => quiz.kind === 'custom');
        setCustomQuizzes(quizzes);
        setCustomQuizId((current) =>
          quizzes.some((quiz: QuizOption) => quiz.id === current) ? current : quizzes[0]?.id ?? '',
        );
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load custom quizzes.');
      });
  }, [password]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPassword = passwordInput;
    if (!nextPassword) return;
    if (await loadStatistics(nextPassword, testType, customQuizId)) {
      sessionStorage.setItem(PASSWORD_KEY, nextPassword);
      setPassword(nextPassword);
      setPasswordInput('');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(PASSWORD_KEY);
    setPassword('');
    setStatistics(null);
    setCustomQuizzes([]);
    setCustomQuizId('');
    setError('');
    setAuthenticated(false);
  }

  const sortedQuestions = useMemo(() => {
    if (!statistics) return [];
    return [...statistics.questions].sort((a, b) => {
      if (a.accuracyPercent === null) return b.accuracyPercent === null ? 0 : 1;
      if (b.accuracyPercent === null) return -1;
      return a.accuracyPercent - b.accuracyPercent || b.responses - a.responses;
    });
  }, [statistics]);

  const totalAnswers = statistics?.questions.reduce((sum, question) => sum + question.responses, 0) ?? 0;

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Question Statistics</h1>
            <p className="mt-1 text-sm text-muted">
              Review correct and incorrect answers to identify questions candidates find challenging.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
              Admin Dashboard
            </Link>
            <Link to="/portal" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
              Back
            </Link>
          </div>
        </header>

        {!password && (
          <form onSubmit={handleLogin} className="mt-6 flex max-w-lg gap-3 rounded-2xl border border-white/10 bg-panel/60 p-5">
            <label className="sr-only" htmlFor="stats-admin-password">Admin password</label>
            <input
              id="stats-admin-password"
              type="password"
              autoComplete="current-password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              placeholder="Enter the admin password"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-sm outline-none focus:border-emerald-400"
            />
            <button disabled={loading} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
              Sign in
            </button>
          </form>
        )}

        {error && <p role="alert" className="mt-5 text-sm text-danger">{error}</p>}

        {authenticated && (
          <>
            <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-panel/60 p-5">
              <label className="flex items-center gap-3 text-sm">
                <span>Assessment</span>
                <select
                  value={testType}
                  onChange={(event) => {
                    const selectedTest = event.target.value as TestType;
                    setTestType(selectedTest);
                    if (selectedTest === 'custom' && !customQuizzes.some((quiz) => quiz.id === customQuizId)) {
                      setCustomQuizId(customQuizzes[0]?.id ?? '');
                    }
                  }}
                  disabled={loading}
                  className="rounded-xl border border-white/15 bg-gray-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
                >
                  {Object.entries(TEST_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              {testType === 'custom' && (
                <label className="flex items-center gap-3 text-sm">
                  <span>Custom quiz</span>
                  <select
                    value={customQuizId}
                    onChange={(event) => setCustomQuizId(event.target.value)}
                    disabled={loading || customQuizzes.length === 0}
                    className="max-w-72 rounded-xl border border-white/15 bg-gray-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
                  >
                    {customQuizzes.length === 0
                      ? <option value="">No custom quizzes available</option>
                      : customQuizzes.map((quiz) => (
                        <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                      ))}
                  </select>
                </label>
              )}
              <button onClick={handleLogout} className="text-sm text-muted underline hover:text-white">Sign out</button>
            </section>

            {authenticated && testType === 'custom' && customQuizzes.length === 0 && !loading && (
              <p className="mt-4 text-sm text-muted">There are no custom quizzes available for question statistics.</p>
            )}
            {loading && <p className="py-6 text-center text-sm text-muted">Loading statistics…</p>}
            {!loading && statistics && (
              <>
                <section className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-panel/60 p-4">
                    <div className="text-sm text-muted">Assessment submissions</div>
                    <div className="mt-1 text-2xl font-semibold">{statistics.submissionCount}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-panel/60 p-4">
                    <div className="text-sm text-muted">Recorded answers</div>
                    <div className="mt-1 text-2xl font-semibold">{totalAnswers}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-panel/60 p-4">
                    <div className="text-sm text-muted">Questions in bank</div>
                    <div className="mt-1 text-2xl font-semibold">{statistics.questions.length}</div>
                  </div>
                </section>

                <p className="mt-4 text-sm text-muted">
                  Accuracy is based on recorded answers for each question. Questions with fewer than {MINIMUM_SAMPLE_SIZE} answers
                  are marked as a small sample; unattempted questions are shown without an accuracy score.
                  Aptitude personality questions are intentionally excluded because they have no right or wrong answer.
                  For custom quizzes, changing a question resets its statistics; results remain in the admin dashboard.
                </p>

                <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-panel/60">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="text-left text-muted">
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3">Question</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Answers</th>
                        <th className="px-4 py-3 text-right">Correct</th>
                        <th className="px-4 py-3 text-right">Incorrect</th>
                        <th className="px-4 py-3 text-right">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedQuestions.map((question) => (
                        <tr key={question.id} className="border-b border-white/5 align-top">
                          <td className="max-w-2xl px-4 py-3">
                            <div className="font-medium">{question.prompt}</div>
                            {question.passage && (
                              <details className="mt-2 text-xs text-muted">
                                <summary className="cursor-pointer">View reading passage</summary>
                                <p className="mt-2 whitespace-pre-wrap">{question.passage}</p>
                              </details>
                            )}
                            <div className="mt-2 text-xs text-muted">Question ID: {question.id}</div>
                          </td>
                          <td className="px-4 py-3 text-muted">{question.category}</td>
                          <td className="px-4 py-3 text-right">{question.responses}</td>
                          <td className="px-4 py-3 text-right text-emerald-300">{question.correct}</td>
                          <td className="px-4 py-3 text-right text-red-300">{question.incorrect}</td>
                          <td className="px-4 py-3 text-right">
                            {question.accuracyPercent === null
                              ? <span className="text-muted">—</span>
                              : (
                                <span className="inline-flex flex-col items-end gap-1">
                                  <span>{question.accuracyPercent}%</span>
                                  {question.responses < MINIMUM_SAMPLE_SIZE && (
                                    <span className="text-xs text-amber-300">Small sample</span>
                                  )}
                                </span>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sortedQuestions.length === 0 && (
                    <p className="p-6 text-center text-sm text-muted">No scored questions are available for this assessment.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
