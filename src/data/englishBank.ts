import type { Question as LibQuestion } from '../lib';
import { shuffle } from '../lib/shuffle';
import englishData from './english.json';

// ─── Types ───────────────────────────────────────────────────────────────────
export type EnglishCategory =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'sentence_completion'
  | 'error_identification';

interface BankQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  passage?: string; // only set for reading comprehension
}

interface ReadingPassage {
  id: string;
  passage: string;
  questions: BankQuestion[];
}

// ─── Question pools (data lives in english.json) ─────────────────────────────
const grammar             = englishData.grammar as BankQuestion[];
const vocabulary          = englishData.vocabulary as BankQuestion[];
const sentenceCompletion  = englishData.sentence_completion as BankQuestion[];
const errorIdentification = englishData.error_identification as BankQuestion[];

// Passages are stored once in the JSON; attach each one to its questions here
// so questions can still be drawn individually.
const reading: BankQuestion[] = (englishData.reading as ReadingPassage[]).flatMap(p =>
  p.questions.map(q => ({ ...q, passage: p.passage })),
);

const POOLS: BankQuestion[][] = [grammar, vocabulary, reading, sentenceCompletion, errorIdentification];
const PICKS_PER_POOL = 5; // 5 questions from each of the 5 pools = 25

// ─── Adapter: BankQuestion → lib Question ────────────────────────────────────
function toLibQuestion(q: BankQuestion): LibQuestion {
  return {
    id:          q.id,
    type:        'grammar' as LibQuestion['type'],
    prompt:      q.passage ? `📄 Read the passage:\n\n"${q.passage}"\n\n${q.prompt}` : q.prompt,
    choices:     q.choices,
    answerIndex: q.answerIndex,
  };
}

// ─── Random selection: 25 questions (5 per category) ─────────────────────────
export function getRandomEnglishQuestions(): LibQuestion[] {
  const selected = POOLS.flatMap(pool => shuffle(pool).slice(0, PICKS_PER_POOL));
  return shuffle(selected).map(toLibQuestion);
}
