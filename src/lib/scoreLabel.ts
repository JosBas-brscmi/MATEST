export function getScoreLabel(percent: number): {
  label: string;
  color: string;
  description: string;
} {
  if (percent >= 90) return { label: 'Exceptional', color: '#4ade80', description: 'Outstanding performance — Top 10%' };
  if (percent >= 75) return { label: 'Above Average', color: '#60a5fa', description: 'Strong performance — Top 25%' };
  if (percent >= 60) return { label: 'Average', color: '#fbbf24', description: 'Good performance — Within normal range' };
  if (percent >= 40) return { label: 'Below Average', color: '#f97316', description: 'Fair performance — Room for improvement' };
  return { label: 'Developing', color: '#f87171', description: 'Additional preparation recommended' };
}
