import React from 'react';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-neon/30" />
        <div className="absolute top-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-neon2/25" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl bg-white/10" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20 relative">
        <div className="flex items-center gap-4">
          <img src="/matta-logo.png" className="h-14 w-14 rounded-full shadow-glow" alt="MATTA logo" />
          <div>
            <div className="text-sm text-muted tracking-widest">BROWAVE CORPORATION</div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">MATTA CENTER</h1>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-muted leading-relaxed">
          Welcome to the local candidate assessment portal for IQ, English, and Aptitude &amp; Personality modules.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-panel/60 p-5 shadow-glow">
            <div className="text-neon font-semibold">IQ Assessment</div>
            <div className="mt-2 text-sm text-muted">Timed, randomized reasoning and verbal items.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-panel/60 p-5 shadow-glow">
            <div className="text-neon2 font-semibold">English</div>
            <div className="mt-2 text-sm text-muted">Reading, grammar, and vocabulary items.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-panel/60 p-5 shadow-glow">
            <div className="font-semibold">Aptitude</div>
            <div className="mt-2 text-sm text-muted">Work scenarios and personality profile.</div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/" className="rounded-xl bg-neon text-ink px-5 py-2.5 font-semibold hover:opacity-90">Candidate registration</a>
          <a href="/admin" className="rounded-xl border border-white/15 px-5 py-2.5 hover:bg-white/5">Administrator</a>
        </div>
        <div className="mt-10 text-xs text-muted max-w-3xl">
          Assessment data is saved to the locally hosted MATTA API and SQLite database.
        </div>
      </div>
    </div>
  );
}
