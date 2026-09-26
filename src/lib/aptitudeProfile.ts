// src/lib/aptitudeProfile.ts
import type { Question } from '../lib';

export type TraitKey =
  | 'ownership'
  | 'integrity'
  | 'teamwork'
  | 'adaptability'
  | 'learning'
  | 'execution';

export const TRAITS: { key: TraitKey; en: string; zh: string }[] = [
  { key: 'ownership', en: 'Ownership', zh: '責任感/主人翁' },
  { key: 'integrity', en: 'Integrity', zh: '誠信/正直' },
  { key: 'teamwork', en: 'Teamwork', zh: '團隊合作' },
  { key: 'adaptability', en: 'Adaptability', zh: '適應力/抗壓' },
  { key: 'learning', en: 'Learning Agility', zh: '學習敏捷' },
  { key: 'execution', en: 'Execution', zh: '執行力/紀律' },
];

export type AptitudeProfile = {
  traitScores: Record<TraitKey, number>; // 0..100
  overall: number; // 0..100
  typeLabelEN: string;
  typeLabelZH: string;
  commentEN: string;
  commentZH: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Likert choices assumed:
 * A Strongly Disagree, B Disagree, C Neutral, D Agree, E Strongly Agree
 * Map choiceIndex 0..4 -> 1..5 points
 */
function choiceIndexToPoints(choiceIndex: number) {
  return clamp(choiceIndex + 1, 1, 5);
}

/**
 * Trait assignment strategy:
 * 1) If question has (trait) field, use it.
 * 2) Else fallback: assign by index evenly across 6 traits (30 items -> 5 each).
 */
function getTraitForQuestion(q: Question, idx: number): TraitKey {
  const anyQ = q as any;
  const t = String(anyQ.trait ?? '').trim();
  if (t) {
    const map: Record<string, TraitKey> = {
      ownership: 'ownership',
      integrity: 'integrity',
      teamwork: 'teamwork',
      adaptability: 'adaptability',
      learning: 'learning',
      execution: 'execution',
    };
    if (map[t]) return map[t];
  }

  // fallback by index blocks of 5
  const block = Math.floor(idx / 5); // 0..5
  const keys: TraitKey[] = [
    'ownership',
    'integrity',
    'teamwork',
    'adaptability',
    'learning',
    'execution',
  ];
  return keys[block] ?? 'execution';
}

function isReverseCoded(q: Question): boolean {
  const anyQ = q as any;
  return Boolean(anyQ.reverse === true || anyQ.reverseCoded === true);
}

/**
 * Compute trait scores from answers.
 * answers: Record<questionId, choiceIndex>
 */
export function computeAptitudeProfile(
  questions: Question[],
  answers: Record<string, number>
): AptitudeProfile {
  const sums: Record<TraitKey, number> = {
    ownership: 0,
    integrity: 0,
    teamwork: 0,
    adaptability: 0,
    learning: 0,
    execution: 0,
  };

  const counts: Record<TraitKey, number> = {
    ownership: 0,
    integrity: 0,
    teamwork: 0,
    adaptability: 0,
    learning: 0,
    execution: 0,
  };

  questions.forEach((q, idx) => {
    const a = answers[q.id];
    if (a === undefined || a === null) return;

    const trait = getTraitForQuestion(q, idx);
    let pts = choiceIndexToPoints(a); // 1..5

    if (isReverseCoded(q)) {
      pts = 6 - pts; // reverse: 1<->5, 2<->4
    }

    sums[trait] += pts;
    counts[trait] += 1;
  });

  // Convert to 0..100 by avg(1..5) -> (avg-1)/4*100
  const traitScores = {} as Record<TraitKey, number>;

  let overallSum = 0;
  let overallCnt = 0;

  (Object.keys(sums) as TraitKey[]).forEach((k) => {
    const c = counts[k] || 0;
    const avg = c > 0 ? sums[k] / c : 0; // 1..5
    const norm = c > 0 ? Math.round(((avg - 1) / 4) * 100) : 0;
    traitScores[k] = clamp(norm, 0, 100);

    if (c > 0) {
      overallSum += traitScores[k];
      overallCnt += 1;
    }
  });

  const overall = overallCnt > 0 ? Math.round(overallSum / overallCnt) : 0;

  // Simple typing logic (可後續再精緻化)
  const sorted = (Object.keys(traitScores) as TraitKey[])
    .map((k) => ({ k, v: traitScores[k] }))
    .sort((a, b) => b.v - a.v);

  const top1 = sorted[0];
  const top2 = sorted[1];
  const low1 = sorted[sorted.length - 1];

  const topTraitNameEN = TRAITS.find((t) => t.key === top1.k)?.en ?? top1.k;
  const topTraitNameZH = TRAITS.find((t) => t.key === top1.k)?.zh ?? top1.k;

  const { typeLabelEN, typeLabelZH } = overall >= 75 && top1.v >= 80
    ? {
      typeLabelEN: `High-Potential (${topTraitNameEN}-driven)`,
      typeLabelZH: `高潛力（以「${topTraitNameZH}」為強項）`,
    }
    : overall >= 60
    ? (() => {
    const top2EN = TRAITS.find((t) => t.key === top2.k)?.en ?? top2.k;
    const top2ZH = TRAITS.find((t) => t.key === top2.k)?.zh ?? top2.k;
      return {
        typeLabelEN: `Operational Fit (${topTraitNameEN} + ${top2EN})`,
        typeLabelZH: `適配型（${topTraitNameZH}＋${top2ZH}）`,
      };
    })()
    : (() => {
    const lowEN = TRAITS.find((t) => t.key === low1.k)?.en ?? low1.k;
    const lowZH = TRAITS.find((t) => t.key === low1.k)?.zh ?? low1.k;
      return {
        typeLabelEN: `Needs Review (${topTraitNameEN} strong, ${lowEN} risk)`,
        typeLabelZH: `需審視（強項：${topTraitNameZH}；風險：${lowZH}）`,
      };
    })();

  const lowTraitNameEN = TRAITS.find((t) => t.key === low1.k)?.en ?? low1.k;
  const lowTraitNameZH = TRAITS.find((t) => t.key === low1.k)?.zh ?? low1.k;

  const commentEN =
    `Aptitude profile suggests ${typeLabelEN}. ` +
    `Strength: ${topTraitNameEN}. Potential risk: ${lowTraitNameEN}. ` +
    `Use this as a screening signal; validate via interview and references.`;

  const commentZH =
    `性向量表顯示：${typeLabelZH}。` +
    `優勢面向：${topTraitNameZH}；相對需留意：${lowTraitNameZH}。` +
    `建議作為初篩訊號，仍需搭配面談與背調進一步驗證。`;

  return {
    traitScores,
    overall,
    typeLabelEN,
    typeLabelZH,
    commentEN,
    commentZH,
  };
}

