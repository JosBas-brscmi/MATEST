import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRandomIQQuestions } from '../data/questionBank';
import { getRandomEnglishQuestions } from '../data/englishBank';
import { getAptitudeQuestions } from '../data/aptitudeBank';
import { TEST_SPECS, scoreSimple, formatDuration } from '../lib';
import type { Question } from '../lib';

// ── Progress helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'matta_test_progress_v1';

function markCompleted(key: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const p = raw ? JSON.parse(raw) : { iq: 'available', english: 'locked', aptitude: 'locked' };
    p[key] = 'completed';
    if (key === 'iq'      && p.english  === 'locked') p.english  = 'available';
    if (key === 'english' && p.aptitude === 'locked') p.aptitude = 'available';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

function loadQuestions(testKey: string): Question[] {
  switch (testKey) {
    case 'iq':       return getRandomIQQuestions();
    case 'english':  return getRandomEnglishQuestions();
    case 'aptitude': return getAptitudeQuestions();
    default:         return [];
  }
}

const TYPE_LABEL: Record<string, string> = {
  logical_reasoning:    '🔷 Pattern Recognition',
  number_series:        '🔢 Number Sequence',
  figure_reasoning:     '🔲 Matrix Reasoning',
  grammar:              '✏️ Grammar',
  vocabulary:           '📚 Vocabulary',
  reading:              '📖 Reading Comprehension',
  sentence_completion:  '✍️ Sentence Completion',
  error_identification: '🔍 Error Identification',
  likert:               '🧭 Personality',
};

export default function TestRunner() {
  const { testKey = 'iq' } = useParams<{ testKey: string }>();
  const navigate = useNavigate();

  const spec      = TEST_SPECS[testKey as keyof typeof TEST_SPECS] ?? TEST_SPECS.iq;
  const totalTime = spec.durationMinutes * 60;
  const isAptitude = testKey === 'aptitude';

  const [questions]    = useState<Question[]>(() => loadQuestions(testKey));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]     = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft]   = useState(totalTime);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (questions.length === 0) {
      alert('This assessment is not yet available. Coming soon!');
      navigate('/portal');
    }
  }, [questions, navigate]);

  const submitTest = useCallback(
    async (auto = false) => {
      if (submitted || submitting) return;
      setSubmitting(true);
      setSubmitError('');

      const { correct, total } = scoreSimple(questions, answers);
      const percent            = Math.round((correct / total) * 100);
      const testId             = `${testKey.toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const submittedAtISO     = new Date().toISOString();

      // Candidate details are collected locally before the assessment starts.
      let candidateInfo: Record<string, string> = {};
      try {
        const raw = sessionStorage.getItem('candidateInfo');
        if (raw) candidateInfo = JSON.parse(raw);
      } catch { /* ignore */ }

      if (!candidateInfo.email) {
        setSubmitError('Candidate information is missing. Return to registration and enter your details before submitting.');
        setSubmitting(false);
        return;
      }

      const resultPayload = {
        testKey: testId,
        testType: testKey,
        candidateEmail:  candidateInfo.email    ?? '',
        candidateName:   candidateInfo.fullName ?? '',
        candidateSchool: candidateInfo.school   ?? '',
        candidateCourse: candidateInfo.course   ?? '',
        candidatePhone:  candidateInfo.phone    ?? '',
        submittedAtISO,
        score: { correct, total, percent },
        answers,
        autoSubmitted: auto,
      };

      try {
        sessionStorage.setItem(`lastResult:${testKey}`, JSON.stringify(resultPayload));
      } catch { /* ignore */ }

      try {
        const response = await fetch('/api/results', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(resultPayload),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || `Submission failed (${response.status}).`);
        }
      } catch (e) {
        console.error('Submit error:', e);
        setSubmitError(e instanceof Error ? e.message : 'Could not save your result. Check the local API and retry.');
        setSubmitting(false);
        return;
      }

      markCompleted(testKey);
      setSubmitted(true);
      navigate(`/results/${testKey}`);
    },
    [answers, questions, testKey, submitted, submitting, navigate]
  );

  useEffect(() => {
    if (submitted || submitting || submitError) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); submitTest(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [submitTest, submitted, submitting, submitError]);

  if (questions.length === 0) return null;

  const q             = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const timePct       = (timeLeft / totalTime) * 100;
  const progressPct   = ((currentIndex + 1) / questions.length) * 100;
  const isLowTime     = timeLeft <= 300;
  const isPersonalityQ = q.type === 'likert';
  const isReading      = q.prompt.startsWith('📄 Read the passage:');
  const isAptitudeQ    = q.prompt.startsWith('💼 Workplace Situation:');

  // Aptitude section label
  const aptitudeSection = isAptitude
    ? currentIndex < 15 ? 'Part 1 of 2 — Work Aptitude' : 'Part 2 of 2 — Personality'
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-lg transition-all ${
          isLowTime ? 'bg-red-900/40 border-red-600 text-red-400 animate-pulse'
                    : 'bg-gray-900 border-gray-700 text-green-400'
        }`}>
          ⏱ {formatDuration(timeLeft)}
        </div>

        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${
            isLowTime ? 'bg-red-500' : timePct > 50 ? 'bg-green-500' : 'bg-yellow-500'
          }`} style={{ width: `${timePct}%` }} />
        </div>

        <span className="text-gray-400 text-sm whitespace-nowrap">{currentIndex + 1} / {questions.length}</span>
        <span className="text-xs text-gray-600 hidden md:block">{answeredCount} answered</span>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-56 border-r border-gray-800 bg-gray-900/30 p-4 gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Questions</p>

          {/* Aptitude: show two sections */}
          {isAptitude && (
            <div className="flex flex-col gap-1 mb-3">
              <div className="text-xs text-gray-600 font-medium">💼 Work Aptitude (1–15)</div>
              <div className="text-xs text-gray-600 font-medium">🧭 Personality (16–30)</div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((_, i) => {
              const isPersonalitySection = isAptitude && i >= 15;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                    i === currentIndex
                      ? 'bg-green-500 text-black ring-2 ring-green-300'
                      : answers[questions[i].id] !== undefined
                      ? isPersonalitySection
                        ? 'bg-purple-900/60 text-purple-400 border border-purple-700'
                        : 'bg-green-900/60 text-green-400 border border-green-700'
                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-1">
            {isAptitude && (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <div className="w-3 h-3 rounded bg-green-900/60 border border-green-700" /> Aptitude
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <div className="w-3 h-3 rounded bg-purple-900/60 border border-purple-700" /> Personality
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <div className="w-3 h-3 rounded bg-gray-800" /> Unanswered
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-1">{answeredCount}/{questions.length} answered</p>
          </div>
        </aside>

        {/* ── Main area ── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl">

            {/* Section banner for aptitude */}
            {aptitudeSection && (
              <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-xl text-xs font-medium ${
                isPersonalityQ
                  ? 'bg-purple-900/30 border border-purple-700/50 text-purple-300'
                  : 'bg-blue-900/30 border border-blue-700/50 text-blue-300'
              }`}>
                {aptitudeSection}
              </div>
            )}

            {/* Type tag */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-full px-3 py-1">
                {TYPE_LABEL[q.type] ?? q.type}
              </span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-5">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }} />
            </div>

            {/* Question card */}
            {isReading ? (
              <div className="flex flex-col gap-4 mb-6">
                {(() => {
                  const parts   = q.prompt.split('\n\n');
                  const passage = parts[1]?.replace(/^"|"$/g, '') ?? '';
                  const qText   = parts[2] ?? '';
                  return (
                    <>
                      <div className="bg-gray-900 border border-blue-900/50 rounded-2xl p-5">
                        <p className="text-xs text-blue-400 uppercase tracking-wider font-medium mb-2">📄 Passage</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{passage}</p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Question {currentIndex + 1}</p>
                        <p className="text-white text-base font-medium leading-relaxed">{qText}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : isPersonalityQ ? (
              <div className="bg-purple-900/20 border border-purple-700/40 rounded-2xl p-6 mb-6">
                <p className="text-xs text-purple-400 uppercase tracking-wider font-medium mb-3">
                  Statement {currentIndex - 14} of 15
                </p>
                <p className="text-white text-lg leading-relaxed font-medium">
                  {q.prompt.replace('🧭 Rate your agreement with the following statement:\n\n', '').replace(/^"|"$/g, '')}
                </p>
                <p className="text-purple-400/70 text-xs mt-3">
                  There are no right or wrong answers — answer honestly.
                </p>
              </div>
            ) : isAptitudeQ ? (
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-2xl p-6 mb-6">
                <p className="text-xs text-blue-400 uppercase tracking-wider font-medium mb-3">
                  Situation {currentIndex + 1} of 15
                </p>
                <p className="text-white text-base leading-relaxed font-medium">
                  {q.prompt.replace('💼 Workplace Situation:\n\n', '')}
                </p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Question {currentIndex + 1}</p>
                <p className="text-white text-lg leading-relaxed whitespace-pre-line font-medium">{q.prompt}</p>
              </div>
            )}

            {/* Options — Likert gets special layout */}
            {isPersonalityQ ? (
              <div className="flex flex-col gap-2 mb-8">
                {q.choices.map((choice, i) => {
                  const selected = answers[q.id] === i;
                  const colors = [
                    'border-red-700/50 bg-red-900/20 text-red-300',
                    'border-orange-700/50 bg-orange-900/20 text-orange-300',
                    'border-gray-600 bg-gray-800 text-gray-300',
                    'border-blue-700/50 bg-blue-900/20 text-blue-300',
                    'border-green-700/50 bg-green-900/20 text-green-300',
                  ];
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                      className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? `${colors[i]} ring-2 ring-offset-1 ring-offset-gray-950 ${
                              i <= 1 ? 'ring-red-500' : i === 2 ? 'ring-gray-500' : 'ring-green-500'
                            } scale-[1.02]`
                          : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'border-current' : 'border-gray-600'
                      }`}>
                        {selected && <div className="w-3 h-3 rounded-full bg-current" />}
                      </div>
                      <span className="text-sm font-medium">{choice}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {q.choices.map((choice, i) => {
                  const selected = answers[q.id] === i;
                  const labels = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        selected
                          ? 'bg-green-900/40 border-green-500 shadow-lg shadow-green-900/30'
                          : 'bg-gray-900 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        selected ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {labels[i]}
                      </div>
                      <span className={`text-sm font-medium ${selected ? 'text-green-200' : 'text-gray-300'}`}>
                        {choice}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => submitTest(false)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black text-sm font-black uppercase tracking-wide transition-all hover:scale-105 shadow-lg shadow-green-900/40 disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit ✓'}
                </button>
              )}
            </div>

            {currentIndex < questions.length - 1 && answeredCount === questions.length && (
              <button
                onClick={() => submitTest(false)}
                disabled={submitting}
                className="mt-4 w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black text-sm font-black uppercase tracking-wide transition-all hover:scale-105 shadow-lg shadow-green-900/40"
              >
                {submitting ? 'Submitting...' : '✓ All Answered — Submit Now'}
              </button>
            )}

            {submitError && (
              <div role="alert" className="mt-4 rounded-xl border border-red-700 bg-red-950/60 p-4 text-sm text-red-200">
                <p>{submitError}</p>
                <div className="mt-3 flex gap-3">
                  <button onClick={() => submitTest(timeLeft === 0)} className="rounded-lg bg-red-800 px-4 py-2 font-semibold hover:bg-red-700">
                    Retry submission
                  </button>
                  <button onClick={() => navigate('/')} className="rounded-lg border border-red-700 px-4 py-2 hover:bg-red-900/50">
                    Return to registration
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


