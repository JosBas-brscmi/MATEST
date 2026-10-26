import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib';
import type { CustomQuizSummary } from '../lib';

const PASSWORD_KEY = 'matta_admin_password';

interface ManageQuizzesProps {
  mode: 'remove' | 'modify';
}

export default function ManageQuizzes({ mode }: ManageQuizzesProps) {
  const [quizzes, setQuizzes] = useState<CustomQuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState('');
  const [error, setError] = useState('');

  async function loadQuizzes() {
    const adminPassword = sessionStorage.getItem(PASSWORD_KEY);
    if (!adminPassword) {
      setError('Your admin session has expired. Return to the dashboard and sign in again.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Could not load quizzes (${response.status}).`);
      setQuizzes(data.quizzes ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load quizzes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuizzes();
  }, []);

  async function removeQuiz(quiz: CustomQuizSummary) {
    const confirmed = window.confirm(
      `Delete "${quiz.title}" from the candidate portal?\n\nExisting submissions and their results will be preserved.`,
    );
    if (!confirmed) return;

    const adminPassword = sessionStorage.getItem(PASSWORD_KEY);
    if (!adminPassword) {
      setError('Your admin session has expired. Return to the dashboard and sign in again.');
      return;
    }

    setRemovingId(quiz.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/quizzes/${encodeURIComponent(quiz.id)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Could not delete quiz (${response.status}).`);
      setQuizzes((current) => current.filter((item) => item.id !== quiz.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not delete quiz.');
    } finally {
      setRemovingId('');
    }
  }

  const isRemoving = mode === 'remove';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-400">Admin</div>
            <h1 className="mt-1 text-2xl font-bold">{isRemoving ? 'Remove Quiz' : 'Modify Quiz'}</h1>
            <p className="mt-2 text-sm text-gray-400">
              {isRemoving
                ? 'Choose a quiz to remove it from the candidate portal. Existing submissions are kept.'
                : 'Choose a quiz to edit its title, duration, questions, and answers.'}
            </p>
          </div>
          <Link to="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">Back</Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
          {loading && <p className="text-sm text-gray-400">Loading quizzes…</p>}
          {error && <div role="alert" className="mb-4 rounded-xl border border-red-700 bg-red-950/50 p-4 text-sm text-red-200">{error}</div>}
          {!loading && !error && quizzes.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">There are no custom quizzes to {isRemoving ? 'remove' : 'modify'}.</p>
          )}
          {!loading && quizzes.length > 0 && (
            <ul className="divide-y divide-white/10">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <h2 className="font-semibold">{quiz.title}</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      {quiz.questionCount} question{quiz.questionCount === 1 ? '' : 's'} · {quiz.durationMinutes} minutes
                    </p>
                  </div>
                  {isRemoving ? (
                    <button
                      type="button"
                      disabled={Boolean(removingId)}
                      onClick={() => void removeQuiz(quiz)}
                      className="rounded-xl border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {removingId === quiz.id ? 'Removing…' : 'Remove'}
                    </button>
                  ) : (
                    <Link
                      to={`/admin/quizzes/${encodeURIComponent(quiz.id)}/edit`}
                      className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Modify
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
