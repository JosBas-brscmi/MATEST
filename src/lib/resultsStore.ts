// src/lib/resultsStore.ts
import type { TestKey } from './index';

export type ProgressState = 'locked' | 'available' | 'completed';
export type ProgressMap = Record<TestKey, ProgressState>;

export const PROGRESS_KEY = 'matta_test_progress_v1';
export const RESULTS_ALL_KEY = 'matta_results_all_v1';

export const ORDER: TestKey[] = ['iq', 'english', 'aptitude'];

export const DEFAULT_PROGRESS: ProgressMap = {
  iq: 'available',
  english: 'locked',
  aptitude: 'locked',
};

export function safeParseProgress(raw: string | null): ProgressMap {
  if (!raw) return DEFAULT_PROGRESS;
  try {
    const p = JSON.parse(raw) as Partial<ProgressMap>;
    return {
      iq: p.iq ?? DEFAULT_PROGRESS.iq,
      english: p.english ?? DEFAULT_PROGRESS.english,
      aptitude: p.aptitude ?? DEFAULT_PROGRESS.aptitude,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function loadProgress(): ProgressMap {
  return safeParseProgress(localStorage.getItem(PROGRESS_KEY));
}

export function saveProgress(p: ProgressMap) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function getNextKey(k: TestKey): TestKey | null {
  const i = ORDER.indexOf(k);
  if (i < 0) return null;
  return ORDER[i + 1] ?? null;
}

export function resetAllLocalState() {
  // progress
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));

  // total results cache
  localStorage.removeItem(RESULTS_ALL_KEY);

  // last results cache
  try {
    sessionStorage.removeItem('lastResult:iq');
    sessionStorage.removeItem('lastResult:english');
    sessionStorage.removeItem('lastResult:aptitude');
  } catch {
    // ignore
  }
}

export type AnyPayload = any;

export type ResultsAll = Partial<Record<TestKey, AnyPayload>>;

export function loadResultsAll(): ResultsAll {
  const raw = localStorage.getItem(RESULTS_ALL_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ResultsAll;
  } catch {
    return {};
  }
}

export function saveResultsAll(all: ResultsAll) {
  localStorage.setItem(RESULTS_ALL_KEY, JSON.stringify(all));
}

export function setResultForKey(testKey: TestKey, payload: AnyPayload) {
  const all = loadResultsAll();
  all[testKey] = payload;
  saveResultsAll(all);
}

export function isAllDone(p: ProgressMap): boolean {
  return p.iq === 'completed' && p.english === 'completed' && p.aptitude === 'completed';
}

