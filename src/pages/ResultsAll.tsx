import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TestKey } from '../lib';

function readLast(testKey: TestKey) {
  const raw = sessionStorage.getItem(`lastResult:${testKey}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ResultsAll() {
  const nav = useNavigate();

  const iq = useMemo(() => readLast('iq'), []);
  const english = useMemo(() => readLast('english'), []);
  const aptitude = useMemo(() => readLast('aptitude'), []);

  const missing: string[] = [];
  if (!iq) missing.push('IQ');
  if (!english) missing.push('English');
  if (!aptitude) missing.push('Aptitude & Personality');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-panel/60 p-6 shadow-glow">
        <div className="text-2xl font-semibold">Combined Report</div>
        <div className="text-sm text-muted mt-2">
          This page is reserved for the final combined report (IQ + English + Aptitude).
        </div>

        {missing.length > 0 ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Missing results</div>
            <div className="text-sm text-muted mt-1">
              Please complete all assessments first: {missing.join(', ')}.
            </div>
            <button
              onClick={() => nav('/portal')}
              className="mt-4 rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
            >
              Back to Portal
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">All results found</div>
            <div className="text-sm text-muted mt-1">
              Next step: generate a combined PDF (will be implemented next).
            </div>
            <button
              onClick={() => nav('/portal')}
              className="mt-4 rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
            >
              Back to Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

