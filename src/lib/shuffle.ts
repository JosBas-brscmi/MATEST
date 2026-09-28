/**
 * Fisher–Yates shuffle. Returns a new array and leaves the input untouched.
 * Unlike `arr.sort(() => Math.random() - 0.5)`, every ordering is equally likely.
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
