import type { Question as LibQuestion } from '../lib';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── WORK APTITUDE — 15 questions (situational judgment + logical) ────────────
export const workAptitudeQuestions: AptitudeQuestion[] = [
  {
    id: 'wa01', category: 'work_aptitude',
    question: 'Your manager assigns you three urgent tasks at the same time. What is the best approach?',
    options: [
      'Start all three simultaneously to save time',
      'Ask your manager to prioritize them, then work through them in order',
      'Complete the easiest one first to build momentum',
      'Ignore all three until you have more clarity',
    ],
    answer: 1,
  },
  {
    id: 'wa02', category: 'work_aptitude',
    question: 'A colleague shares confidential client information with you without permission. You should:',
    options: [
      'Share it further since you already know it',
      'Ignore it and pretend you never heard it',
      'Remind the colleague of confidentiality policies and report if necessary',
      'Use the information to your advantage',
    ],
    answer: 2,
  },
  {
    id: 'wa03', category: 'work_aptitude',
    question: 'You notice a process in your team that is inefficient. What is the most professional response?',
    options: [
      'Complain to other colleagues about the inefficiency',
      'Ignore it — it is not your responsibility',
      'Document the issue and propose an improvement to your supervisor',
      'Change the process on your own without informing anyone',
    ],
    answer: 2,
  },
  {
    id: 'wa04', category: 'work_aptitude',
    question: 'During a team meeting, a colleague presents an idea you believe is flawed. You should:',
    options: [
      'Stay silent to avoid conflict',
      'Interrupt and immediately point out the flaws',
      'Wait for an appropriate moment and respectfully share your concerns with evidence',
      'Talk to others privately to build opposition against the idea',
    ],
    answer: 2,
  },
  {
    id: 'wa05', category: 'work_aptitude',
    question: 'You made an error that affected a client deliverable. What is the best course of action?',
    options: [
      'Hope no one notices and move on',
      'Blame the error on a teammate',
      'Acknowledge the mistake, inform your supervisor, and propose a solution',
      'Redo the work quietly without informing anyone',
    ],
    answer: 2,
  },
  {
    id: 'wa06', category: 'work_aptitude',
    question: 'A client is upset about a delay in delivery. You are not directly responsible. You should:',
    options: [
      'Tell the client it is not your fault',
      'Avoid the client until the issue is resolved',
      'Apologize on behalf of the team and provide an updated timeline',
      'Ignore the complaint since you did not cause it',
    ],
    answer: 2,
  },
  {
    id: 'wa07', category: 'work_aptitude',
    question: 'You are given a task outside your expertise. The best response is to:',
    options: [
      'Refuse the task immediately',
      'Accept it and attempt to complete it without asking for help',
      'Accept it, research what you can, and ask for guidance where needed',
      'Complete it using guesswork to appear capable',
    ],
    answer: 2,
  },
  {
    id: 'wa08', category: 'work_aptitude',
    question: 'Your team is behind schedule on a critical project. As a team member, you should:',
    options: [
      'Work harder individually without coordinating with others',
      'Inform the manager and collaboratively identify where to recover time',
      'Blame team members who are slower',
      'Wait for your manager to notice and solve the issue',
    ],
    answer: 1,
  },
  {
    id: 'wa09', category: 'work_aptitude',
    question: 'You receive negative feedback from your supervisor. The most productive reaction is:',
    options: [
      'Become defensive and justify every decision',
      'Ignore the feedback if you disagree',
      'Listen carefully, ask clarifying questions, and use it to improve',
      'Complain to colleagues about the unfair treatment',
    ],
    answer: 2,
  },
  {
    id: 'wa10', category: 'work_aptitude',
    question: 'Two team members are in conflict, affecting team productivity. As a colleague, you should:',
    options: [
      'Take sides with the person you are closer to',
      'Encourage them to resolve it professionally or escalate to a supervisor',
      'Spread information about the conflict to other teammates',
      'Ignore it — it is none of your business',
    ],
    answer: 1,
  },
  {
    id: 'wa11', category: 'work_aptitude',
    question: 'You realize mid-project that the initial plan will not achieve the goals. You should:',
    options: [
      'Continue with the original plan to avoid extra work',
      'Stop the project immediately without informing stakeholders',
      'Reassess, communicate the issue to stakeholders, and propose adjustments',
      'Pretend the goals were different from the start',
    ],
    answer: 2,
  },
  {
    id: 'wa12', category: 'work_aptitude',
    question: 'A new company policy feels unfair to you and your team. The best approach is:',
    options: [
      'Refuse to follow it until it is changed',
      'Openly criticize management to build resentment',
      'Follow the policy while raising your concerns through proper channels',
      'Ignore the policy and do what you think is right',
    ],
    answer: 2,
  },
  {
    id: 'wa13', category: 'work_aptitude',
    question: 'You are asked to present a project update but do not have all the information yet. You should:',
    options: [
      'Make up the missing information to appear prepared',
      'Cancel the presentation without notice',
      'Present what you have, clearly state what is pending, and give a timeline',
      'Ask a colleague to present in your place without explanation',
    ],
    answer: 2,
  },
  {
    id: 'wa14', category: 'work_aptitude',
    question: 'You are overwhelmed with work and cannot meet all your deadlines. The best action is:',
    options: [
      'Work through the night to finish everything without telling anyone',
      'Inform your manager early and discuss re-prioritizing or getting support',
      'Submit incomplete work without flagging the issues',
      'Take a day off and hope the deadlines are extended',
    ],
    answer: 1,
  },
  {
    id: 'wa15', category: 'work_aptitude',
    question: 'You disagree with a decision made by leadership. The most professional response is:',
    options: [
      'Refuse to implement the decision',
      'Complain loudly in the office to gain sympathy',
      'Express your concerns respectfully through the appropriate channel, then support the final decision',
      'Undermine the decision quietly while appearing to comply',
    ],
    answer: 2,
  },
];

// ─── PERSONALITY — 15 questions (Likert: 1=Strongly Disagree, 5=Strongly Agree) ─
// Options are always the same Likert scale
const LIKERT = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
];

export const personalityQuestions: AptitudeQuestion[] = [
  // Conscientiousness (責任感) — 3 questions
  {
    id: 'p01', category: 'personality', dimension: 'conscientiousness',
    question: 'I always complete tasks on time, even when they require extra effort.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p02', category: 'personality', dimension: 'conscientiousness',
    question: 'I set clear goals for myself and consistently work toward them.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p03', category: 'personality', dimension: 'conscientiousness', reverse: true,
    question: 'I often leave tasks unfinished when something more interesting comes along.',
    options: LIKERT, answer: 0,
  },
  // Extraversion (外向性) — 3 questions
  {
    id: 'p04', category: 'personality', dimension: 'extraversion',
    question: 'I feel energized when working in groups and interacting with many people.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p05', category: 'personality', dimension: 'extraversion',
    question: 'I enjoy taking the lead in group discussions or team projects.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p06', category: 'personality', dimension: 'extraversion', reverse: true,
    question: 'I prefer working alone rather than in a team environment.',
    options: LIKERT, answer: 0,
  },
  // Agreeableness (適應力) — 3 questions
  {
    id: 'p07', category: 'personality', dimension: 'agreeableness',
    question: 'I find it easy to cooperate with people who have different working styles.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p08', category: 'personality', dimension: 'agreeableness',
    question: 'I genuinely care about the well-being of my colleagues.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p09', category: 'personality', dimension: 'agreeableness', reverse: true,
    question: 'I find it difficult to compromise when I believe I am right.',
    options: LIKERT, answer: 0,
  },
  // Emotional Stability (抗壓性) — 3 questions
  {
    id: 'p10', category: 'personality', dimension: 'emotional_stability',
    question: 'I remain calm and focused when working under tight deadlines.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p11', category: 'personality', dimension: 'emotional_stability',
    question: 'I recover quickly from setbacks or professional disappointments.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p12', category: 'personality', dimension: 'emotional_stability', reverse: true,
    question: 'I tend to feel anxious or stressed when facing unexpected changes at work.',
    options: LIKERT, answer: 0,
  },
  // Openness (開放性) — 3 questions
  {
    id: 'p13', category: 'personality', dimension: 'openness',
    question: 'I actively seek out new skills and knowledge relevant to my career.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p14', category: 'personality', dimension: 'openness',
    question: 'I enjoy brainstorming creative solutions to complex problems.',
    options: LIKERT, answer: 0,
  },
  {
    id: 'p15', category: 'personality', dimension: 'openness', reverse: true,
    question: 'I prefer established routines over trying new approaches.',
    options: LIKERT, answer: 0,
  },
];

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

// ─── Get 30 questions (15 aptitude + 15 personality, fixed order) ─────────────
export function getAptitudeQuestions(): LibQuestion[] {
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
  // Work aptitude first, personality second (intentional order)
  const selected = [
    ...shuffle(workAptitudeQuestions).slice(0, 15),
    ...shuffle(personalityQuestions).slice(0, 15),
  ];
  return selected.map(toLibQuestion);
}

// ─── Personality scoring ──────────────────────────────────────────────────────
export interface PersonalityScores {
  conscientiousness:   number; // 0-100
  extraversion:        number;
  agreeableness:       number;
  emotional_stability: number;
  openness:            number;
}

export interface AptitudeScores {
  aptitudeCorrect: number;
  aptitudeTotal:   number;
  aptitudePercent: number;
  personality:     PersonalityScores;
  roleRecommendation: string[];
  roleScores: { key: string; dept: string; fn: string; score: number }[];
  recommendedRoles: string[];
}

export function scoreAptitude(
  answers: Record<string, number>
): AptitudeScores {
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

  // ── Role recommendation: score every role, always return exactly top 3 ──
  // Each role gets a weighted score from personality dimensions.
  // Different weights reflect which traits are most important for each function.
  // Score = weighted average (0-100). Top 3 by score are always returned.

  const p = personality;
  const C = p.conscientiousness;
  const E = p.extraversion;
  const A = p.agreeableness;
  const S = p.emotional_stability;
  const O = p.openness;

  const roleScores: { key: string; dept: string; fn: string; score: number }[] = [
    // Administration/ADM — Administration
    // Needs: organization (C), calm (S), teamwork (A)
    { key: 'ADM-ADM', dept: 'Administration/ADM', fn: 'Administration',
      score: C*0.4 + S*0.35 + A*0.25 },

    // Administration/ADM — Human Resource
    // Needs: people skills (A, E), stability (S)
    { key: 'ADM-HR',  dept: 'Administration/ADM', fn: 'Human Resource',
      score: A*0.40 + E*0.35 + S*0.25 },

    // Financial Accounting/FA — Financial Accounting
    // Needs: precision/detail (C), calmness (S), NOT openness (routine work)
    { key: 'FA-FA',   dept: 'Financial Accounting/FA', fn: 'Financial Accounting',
      score: C*0.55 + S*0.35 + (100-O)*0.10 },

    // Marketing Sales/MS — Sales
    // Needs: outgoing (E), people (A), resilience (S)
    { key: 'MS-SL',   dept: 'Marketing Sales/MS', fn: 'Sales',
      score: E*0.45 + A*0.30 + S*0.25 },

    // Marketing Sales/MS — Customer Service
    // Needs: agreeableness (A), stability (S), some extraversion (E)
    { key: 'MS-CS',   dept: 'Marketing Sales/MS', fn: 'Customer Service',
      score: A*0.50 + S*0.30 + E*0.20 },

    // Material Resource/MR — I/E Custom
    // Needs: conscientiousness (C), openness (O for detail/trade compliance)
    { key: 'MR-IEC',  dept: 'Material Resource/MR', fn: 'I/E Custom',
      score: C*0.45 + O*0.30 + S*0.25 },

    // Material Resource/MR — Supply Chain
    // Needs: organization (C), stability (S), detail (not high O)
    { key: 'MR-SC',   dept: 'Material Resource/MR', fn: 'Supply Chain',
      score: C*0.50 + S*0.35 + A*0.15 },

    // Production & Material Control/PMC — Production Control
    // Needs: discipline (C), calm under pressure (S)
    { key: 'PMC-PC',  dept: 'Production & Material Control/PMC', fn: 'Production Control',
      score: C*0.50 + S*0.40 + A*0.10 },

    // Production & Material Control/PMC — Material Control
    // Needs: conscientiousness (C), teamwork (A), stability (S)
    { key: 'PMC-MC',  dept: 'Production & Material Control/PMC', fn: 'Material Control',
      score: C*0.45 + A*0.30 + S*0.25 },

    // Quality Assurance/QA — Quality Control
    // Needs: high detail/precision (C), stability (S), low extraversion
    { key: 'QA-QC',   dept: 'Quality Assurance/QA', fn: 'Quality Control',
      score: C*0.55 + S*0.30 + (100-E)*0.15 },

    // Quality Assurance/QA — Quality Engineering
    // Needs: conscientiousness (C), analytical (O), stability (S)
    { key: 'QA-QE',   dept: 'Quality Assurance/QA', fn: 'Quality Engineering',
      score: C*0.45 + O*0.35 + S*0.20 },

    // Production Technology/PT — Process
    // Needs: openness/creative problem solving (O), conscientiousness (C)
    { key: 'PT-PR',   dept: 'Production Technology/PT', fn: 'Process',
      score: O*0.45 + C*0.35 + S*0.20 },

    // Production Technology/PT — Equipment
    // Needs: conscientiousness (C), technical curiosity (O), stability (S)
    { key: 'PT-EQ',   dept: 'Production Technology/PT', fn: 'Equipment',
      score: C*0.40 + O*0.35 + S*0.25 },

    // Production Management/PM — Production Management
    // Needs: leadership (E), organization (C), people management (A)
    { key: 'PM-PM',   dept: 'Production Management/PM', fn: 'Production Management',
      score: E*0.35 + C*0.40 + A*0.25 },

    // Manufacturing Information/MI — Software
    // Needs: creativity/logic (O), conscientiousness (C)
    { key: 'MI-SW',   dept: 'Manufacturing Information/MI', fn: 'Software',
      score: O*0.50 + C*0.35 + S*0.15 },

    // Manufacturing Information/MI — Hardware
    // Needs: technical openness (O), precision (C), stability (S)
    { key: 'MI-HW',   dept: 'Manufacturing Information/MI', fn: 'Hardware',
      score: O*0.40 + C*0.40 + S*0.20 },

    // Industrial Engineering/IE — Industrial Engineering
    // Needs: analytical (O), precision (C), stability (S), NOT high extraversion
    { key: 'IE-IE',   dept: 'Industrial Engineering/IE', fn: 'Industrial Engineering',
      score: O*0.40 + C*0.40 + S*0.20 },

    // Facilities Service/FS — Facilities Service
    // Needs: reliability (C), teamwork (A), practical stability (S)
    { key: 'FS-FS',   dept: 'Facilities Service/FS', fn: 'Facilities Service',
      score: C*0.35 + A*0.35 + S*0.30 },
  ];

  // Sort by score descending, take top 3
  roleScores.sort((a, b) => b.score - a.score);
  const top3 = roleScores.slice(0, 3);

  const recommendedRoles = top3.map(r => `${r.dept} - ${r.fn}`);
  const roles = recommendedRoles; // always exactly 3

  return {
    aptitudeCorrect,
    aptitudeTotal:   workAptitudeQuestions.length,
    aptitudePercent: Math.round((aptitudeCorrect / workAptitudeQuestions.length) * 100),
    personality,
    roleRecommendation: roles,
    roleScores,          // full scored list for email highlighting
    recommendedRoles,    // top 3 in dept - fn format
  };
}

export const DIMENSION_LABELS: Record<PersonalityDimension, { label: string; emoji: string; description: string }> = {
  conscientiousness:   { label: 'Conscientiousness', emoji: '📋', description: 'Reliability, organization, and work ethic' },
  extraversion:        { label: 'Extraversion',       emoji: '🗣️', description: 'Sociability, assertiveness, and energy' },
  agreeableness:       { label: 'Agreeableness',      emoji: '🤝', description: 'Cooperation, adaptability, and empathy' },
  emotional_stability: { label: 'Emotional Stability',emoji: '🧘', description: 'Resilience, calmness under pressure' },
  openness:            { label: 'Openness',            emoji: '💡', description: 'Creativity, curiosity, and innovation' },
};

