export type PersonalityDimension =
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'emotional_stability'
  | 'openness';

export const DIMENSION_LABELS: Record<PersonalityDimension, {
  label: string;
  emoji: string;
  description: string;
}> = {
  conscientiousness: {
    label: 'Conscientiousness',
    emoji: '📋',
    description: 'Reliability, organization, and work ethic',
  },
  extraversion: {
    label: 'Extraversion',
    emoji: '🗣️',
    description: 'Sociability, assertiveness, and energy',
  },
  agreeableness: {
    label: 'Agreeableness',
    emoji: '🤝',
    description: 'Cooperation, adaptability, and empathy',
  },
  emotional_stability: {
    label: 'Emotional Stability',
    emoji: '🧘',
    description: 'Resilience, calmness under pressure',
  },
  openness: {
    label: 'Openness',
    emoji: '💡',
    description: 'Creativity, curiosity, and innovation',
  },
};
