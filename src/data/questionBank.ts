import type { Question as LibQuestion, QuestionType as LibQuestionType } from '../lib';
import { shuffle } from '../lib/shuffle';
import iqBank from './iq.json';

// ─── Types ───────────────────────────────────────────────────────────────────
export type QuestionCategory = 'pattern' | 'sequence' | 'matrix';

interface BankQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
}

// Category → lib QuestionType mapping
const typeMap: Record<QuestionCategory, LibQuestionType> = {
  pattern:  'logical_reasoning',
  sequence: 'number_series',
  matrix:   'figure_reasoning',
};

// How many questions to draw from each category (25 total)
const PICKS: Record<QuestionCategory, number> = { pattern: 8, sequence: 8, matrix: 9 };

const bank = iqBank as Record<QuestionCategory, BankQuestion[]>;

// ─── Random selection: 25 questions (8 pattern + 8 sequence + 9 matrix) ──────
export function getRandomIQQuestions(): LibQuestion[] {
  const selected = (Object.keys(PICKS) as QuestionCategory[]).flatMap(cat =>
    shuffle(bank[cat])
      .slice(0, PICKS[cat])
      .map((q): LibQuestion => ({
        id:          q.id,
        type:        typeMap[cat],
        prompt:      q.prompt,
        choices:     q.choices,
        answerIndex: q.answerIndex,
        explanation: q.explanation,
      })),
  );
  return shuffle(selected);
}

// ─── Score label helper ──────────────────────────────────────────────────────
export function getScoreLabel(percent: number): {
  label: string;
  color: string;
  description: string;
} {
  if (percent >= 90) return { label: 'Exceptional',   color: '#4ade80', description: 'Outstanding performance — Top 10%' };
  if (percent >= 75) return { label: 'Above Average', color: '#60a5fa', description: 'Strong performance — Top 25%' };
  if (percent >= 60) return { label: 'Average',       color: '#fbbf24', description: 'Good performance — Within normal range' };
  if (percent >= 40) return { label: 'Below Average', color: '#f97316', description: 'Fair performance — Room for improvement' };
  return               { label: 'Developing',        color: '#f87171', description: 'Additional preparation recommended' };
}
