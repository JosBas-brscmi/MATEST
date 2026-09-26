// src/lib/progress.ts
import type { TestKey } from '../lib';

export type ProgressState = 'locked' | 'available' | 'completed';
export type ProgressMap = Record<TestKey, ProgressState>;

export const STORAGE_KEY = 'matta_test_progress_v1';

export const DEFAULT_PROGRESS: ProgressMap = {
  iq: 'available',
  english: 'locked',
  aptitude: 'locked',
};

function safeParseProgress(raw: string | null): ProgressMap {
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
  return safeParseProgress(localStorage.getItem(STORAGE_KEY));
}

export function saveProgress(p: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}


