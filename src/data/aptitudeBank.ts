import type { Question as LibQuestion } from '../lib';
import { shuffle } from '../lib/shuffle';
import aptitudeData from './aptitude.json';
import rolesData from './roles.json';

// ─── Types ───────────────────────────────────────────────────────────────────
export type AptitudeCategory =
  | 'work_aptitude'   // situational judgment / logical reasoning (has correct answer)
  | 'personality';    // Likert scale (no wrong answer, scores personality dimensions)

export type PersonalityDimension =
  | 'conscientiousness'   // 責任感
  | 'extraversion'        // 外向性
  | 'agreeableness'       // 適應力
  | 'emotional_stability' // 抗壓性
  | 'openness';           // 開放性

export interface AptitudeQuestion {
  id: string;
  category: AptitudeCategory;
  question: string;
  options: string[];
  answer: number;             // for work_aptitude: correct index; for personality: always 0 (not used for scoring)
  dimension?: PersonalityDimension; // for personality questions
  reverse?: boolean;          // if true, scoring is reversed for this personality item
}

// ─── Questions (data lives in aptitude.json) ─────────────────────────────────
export const workAptitudeQuestions: AptitudeQuestion[] = aptitudeData.workAptitude.map(q => ({
  id:       q.id,
  category: 'work_aptitude',
  question: q.prompt,
  options:  q.choices,
  answer:   q.answerIndex,
}));

// Personality items are Likert statements: the same 5-point scale for all of them
export const personalityQuestions: AptitudeQuestion[] = aptitudeData.personality.map(q => ({
  id:        q.id,
  category:  'personality',
  dimension: q.dimension as PersonalityDimension,
  reverse:   q.reverse || undefined,
  question:  q.prompt,
  options:   aptitudeData.likertScale,
  answer:    0,
}));

export const DIMENSION_LABELS = aptitudeData.dimensions as Record<
  PersonalityDimension,
  { label: string; emoji: string; description: string }
>;

// ─── Adapter: convert to lib Question ────────────────────────────────────────
function toLibQuestion(q: AptitudeQuestion): LibQuestion {
  const isPersonality = q.category === 'personality';
  return {
    id:          q.id,
    type:        isPersonality ? 'likert' : 'logical_reasoning',
    prompt:      isPersonality
      ? `🧭 Rate your agreement with the following statement:\n\n"${q.question}"`
      : `💼 Workplace Situation:\n\n${q.question}`,
    choices:     q.options,
    answerIndex: q.answer,
  };
}

// ─── Get 30 questions (15 aptitude first, then 15 personality; shuffled within each) ─
export function getAptitudeQuestions(): LibQuestion[] {
  const selected = [
    ...shuffle(workAptitudeQuestions).slice(0, 15),
    ...shuffle(personalityQuestions).slice(0, 15),
  ];
  return selected.map(toLibQuestion);
}

// ─── Scoring types ───────────────────────────────────────────────────────────
export interface PersonalityScores {
  conscientiousness:   number; // 0-100
  extraversion:        number;
  agreeableness:       number;
  emotional_stability: number;
  openness:            number;
}

export interface RoleScore {
  key:   string;
  dept:  string;
  fn:    string;
  score: number;
}

export interface AptitudeScores {
  aptitudeCorrect: number;
  aptitudeTotal:   number;
  aptitudePercent: number;
  personality:     PersonalityScores;
  roleRecommendation: string[];
  roleScores: RoleScore[];
  recommendedRoles: string[];
}

// Role weights live in roles.json.
//   weights: score += personality[dim] * w
//   inverse: score += (100 - personality[dim]) * w   (traits that count *against* a high score)
interface RoleDef {
  key:  string;
  dept: string;
  fn:   string;
  weights:  Partial<Record<PersonalityDimension, number>>;
  inverse?: Partial<Record<PersonalityDimension, number>>;
}
const ROLES = rolesData as RoleDef[];

// ─── Scoring ─────────────────────────────────────────────────────────────────
export function scoreAptitude(answers: Record<string, number>): AptitudeScores {
  // ── Work aptitude score ──
  let aptitudeCorrect = 0;
  for (const q of workAptitudeQuestions) {
    if (answers[q.id] === q.answer) aptitudeCorrect++;
  }

  // ── Personality scores per dimension ──
  const dimScores: Record<PersonalityDimension, number[]> = {
    conscientiousness:   [],
    extraversion:        [],
    agreeableness:       [],
    emotional_stability: [],
    openness:            [],
  };

  for (const q of personalityQuestions) {
    if (!q.dimension) continue;
    const raw = answers[q.id]; // 0-4 (index of Likert option)
    if (raw === undefined) continue;
    const score = q.reverse ? (4 - raw) : raw; // reverse scoring if needed
    dimScores[q.dimension].push(score);
  }

  // Convert 0-4 scale to 0-100
  const toPercent = (scores: number[]) => {
    if (scores.length === 0) return 50;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round((avg / 4) * 100);
  };

  const personality: PersonalityScores = {
    conscientiousness:   toPercent(dimScores.conscientiousness),
    extraversion:        toPercent(dimScores.extraversion),
    agreeableness:       toPercent(dimScores.agreeableness),
    emotional_stability: toPercent(dimScores.emotional_stability),
    openness:            toPercent(dimScores.openness),
  };

  // ── Role recommendation: score every role, always return exactly the top 3 ──
  const roleScores: RoleScore[] = ROLES.map(r => {
    let score = 0;
    for (const [dim, w] of Object.entries(r.weights)) {
      score += personality[dim as PersonalityDimension] * (w as number);
    }
    for (const [dim, w] of Object.entries(r.inverse ?? {})) {
      score += (100 - personality[dim as PersonalityDimension]) * (w as number);
    }
    return { key: r.key, dept: r.dept, fn: r.fn, score };
  });

  // Sort by score descending (stable, so ties keep roles.json order), take top 3
  roleScores.sort((a, b) => b.score - a.score);
  const recommendedRoles = roleScores.slice(0, 3).map(r => `${r.dept} - ${r.fn}`);

  return {
    aptitudeCorrect,
    aptitudeTotal:   workAptitudeQuestions.length,
    aptitudePercent: Math.round((aptitudeCorrect / workAptitudeQuestions.length) * 100),
    personality,
    roleRecommendation: recommendedRoles, // always exactly 3
    roleScores,                           // full scored list for email highlighting
    recommendedRoles,                     // top 3 in "dept - fn" format
  };
}
