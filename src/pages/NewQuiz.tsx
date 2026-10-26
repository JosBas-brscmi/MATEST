import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib';
import type { Question, QuestionType } from '../lib';
import aptitudeData from '../data/aptitude.json';

const PASSWORD_KEY = 'matta_admin_password';
const LIKERT_CHOICES = aptitudeData.likertScale;
const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: 'logical_reasoning', label: 'Pattern Recognition' },
  { value: 'number_series', label: 'Number Sequence' },
  { value: 'figure_reasoning', label: 'Matrix Reasoning' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'reading', label: 'Reading Comprehension' },
  { value: 'sentence_completion', label: 'Sentence Completion' },
  { value: 'error_identification', label: 'Error Identification' },
  { value: 'likert', label: 'Likert Scale' },
  { value: 'custom', label: 'Custom type' },
];

function makeQuestion(): Question {
  return {
    id: crypto.randomUUID(),
    type: 'logical_reasoning',
    categoryLabel: 'Pattern Recognition',
    title: '',
    prompt: '',
    passage: '',
    passageTitle: 'Passage',
    containerColor: '#111827',
    choices: ['', '', '', ''],
    answerIndex: 0,
  };
}

export default function NewQuiz() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateQuestion(index: number, updates: Partial<Question>) {
    setQuestions((current) => current.map((question, questionIndex) =>
      questionIndex === index ? { ...question, ...updates } : question,
    ));
  }

  function changeQuestionType(index: number, value: QuestionType) {
    const current = questions[index];
    if (value === 'likert') {
      updateQuestion(index, {
        type: 'likert',
        categoryLabel: 'Likert Scale',
        choices: [...LIKERT_CHOICES],
        answerIndex: -1,
      });
      return;
    }

    const typeOption = QUESTION_TYPES.find((option) => option.value === value);
    updateQuestion(index, {
      type: value,
      categoryLabel: value === 'custom' ? '' : typeOption?.label ?? value,
      choices: current.type === 'likert' ? ['', '', '', ''] : current.choices,
      answerIndex: current.type === 'likert' ? 0 : current.answerIndex,
    });
  }

  async function createQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const adminPassword = sessionStorage.getItem(PASSWORD_KEY);
      if (!adminPassword) throw new Error('Your admin session has expired. Sign in again.');
      const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ title, durationMinutes, questions }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Could not create quiz (${response.status}).`);
      navigate('/admin');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create quiz.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-400">Admin</div>
            <h1 className="mt-1 text-2xl font-bold">Create New Quiz</h1>
            <p className="mt-2 text-sm text-gray-400">Saved quizzes become available to candidates in the portal immediately.</p>
          </div>
          <Link to="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">Back</Link>
        </div>

        <form onSubmit={createQuiz} className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
            <label className="block text-sm font-semibold" htmlFor="quiz-title">Quiz title</label>
            <input
              id="quiz-title"
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-emerald-400"
              placeholder="e.g. Workplace Communication"
            />
            <label className="mt-5 block text-sm font-semibold" htmlFor="quiz-duration">Time limit (minutes)</label>
            <input
              id="quiz-duration"
              type="number"
              required
              min={1}
              max={240}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              className="mt-2 w-36 rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </section>

          {questions.map((question, index) => (
            <section key={question.id} className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">Question {index + 1}</h2>
                <button
                  type="button"
                  onClick={() => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="text-sm text-red-300 hover:text-red-200"
                >
                  Remove
                </button>
              </div>

              <label className="block text-sm font-medium" htmlFor={`question-title-${index}`}>Question card title</label>
              <input
                id={`question-title-${index}`}
                maxLength={100}
                value={question.title ?? ''}
                onChange={(event) => updateQuestion(index, { title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 outline-none focus:border-emerald-400"
                placeholder={`Question ${index + 1}`}
              />

              <label className="mt-4 block text-sm font-medium" htmlFor={`question-type-${index}`}>Question type</label>
              <select
                id={`question-type-${index}`}
                value={question.type}
                onChange={(event) => changeQuestionType(index, event.target.value as QuestionType)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-gray-950 px-4 py-2.5 outline-none focus:border-emerald-400"
              >
                {QUESTION_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              {question.type === 'custom' && (
                <input
                  required
                  maxLength={60}
                  value={question.categoryLabel ?? ''}
                  onChange={(event) => updateQuestion(index, { categoryLabel: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 outline-none focus:border-emerald-400"
                  placeholder="Custom type label"
                  aria-label={`Custom type label for question ${index + 1}`}
                />
              )}

              <div className="mt-4 flex items-start gap-3">
                <label className="flex-1 text-sm font-medium" htmlFor={`question-prompt-${index}`}>
                  {question.type === 'likert' ? 'Statement' : 'Question text'}
                  <textarea
                    id={`question-prompt-${index}`}
                    required
                    maxLength={4000}
                    rows={3}
                    value={question.prompt}
                    onChange={(event) => updateQuestion(index, { prompt: event.target.value })}
                    className="mt-2 block w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-base font-normal leading-relaxed outline-none focus:border-emerald-400"
                    placeholder="Enter the question or statement"
                  />
                </label>
                <label className="text-sm font-medium" htmlFor={`question-color-${index}`}>
                  Container
                  <input
                    id={`question-color-${index}`}
                    type="color"
                    value={question.containerColor ?? '#111827'}
                    onChange={(event) => updateQuestion(index, { containerColor: event.target.value })}
                    className="mt-2 block h-12 w-16 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    aria-label={`Container color for question ${index + 1}`}
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm font-medium" htmlFor={`question-passage-${index}`}>
                Passage or shared context (optional)
              </label>
              <input
                maxLength={100}
                value={question.passageTitle ?? ''}
                onChange={(event) => updateQuestion(index, { passageTitle: event.target.value })}
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 outline-none focus:border-emerald-400"
                placeholder="Passage title"
                aria-label={`Passage title for question ${index + 1}`}
              />
              <textarea
                id={`question-passage-${index}`}
                maxLength={10000}
                rows={4}
                value={question.passage ?? ''}
                onChange={(event) => updateQuestion(index, { passage: event.target.value })}
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 leading-relaxed outline-none focus:border-emerald-400"
                placeholder="Optional reading passage or context"
              />

              {question.type === 'likert' ? (
                <div className="mt-5 rounded-xl border border-purple-700/40 bg-purple-900/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-purple-300">Five-point agreement scale · unscored</p>
                  <p className="mt-2 text-sm text-purple-100">{LIKERT_CHOICES.join(' · ')}</p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <p className="text-sm font-medium">Answer choices</p>
                  {question.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold text-gray-300">
                        {String.fromCharCode(65 + choiceIndex)}
                      </span>
                      <input
                        required
                        maxLength={500}
                        value={choice}
                        onChange={(event) => {
                          const choices = [...question.choices];
                          choices[choiceIndex] = event.target.value;
                          updateQuestion(index, { choices });
                        }}
                        className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 outline-none focus:border-emerald-400"
                        placeholder={`Choice ${String.fromCharCode(65 + choiceIndex)}`}
                        aria-label={`Choice ${String.fromCharCode(65 + choiceIndex)} for question ${index + 1}`}
                      />
                      <label className="flex shrink-0 items-center gap-2 text-xs text-gray-400">
                        <input
                          type="radio"
                          name={`correct-answer-${question.id}`}
                          checked={question.answerIndex === choiceIndex}
                          onChange={() => updateQuestion(index, { answerIndex: choiceIndex })}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {error && <div role="alert" className="rounded-xl border border-red-700 bg-red-950/50 p-4 text-sm text-red-200">{error}</div>}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={questions.length >= 100}
              onClick={() => setQuestions((current) => [...current, makeQuestion()])}
              className="rounded-xl border border-emerald-500/40 px-5 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              + Add question
            </button>
            <button
              type="submit"
              disabled={loading || questions.length === 0}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? 'Publishing…' : 'Publish quiz'}
            </button>
          </div>
          {questions.length === 0 && <p className="text-sm text-gray-500">Add at least one question. Each quiz must include a scored question.</p>}
        </form>
      </main>
    </div>
  );
}
