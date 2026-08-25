import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getScoreLabel } from '../data/questionBank';
import {
  scoreAptitude,
  workAptitudeQuestions,
  personalityQuestions,
  DIMENSION_LABELS,
  type AptitudeScores,
  type PersonalityDimension,
} from '../data/aptitudeBank';

interface ResultPayload {
  testKey: string;
  testType: string;
  candidateName: string;
  candidateEmail: string;
  candidateSchool: string;
  candidateCourse: string;
  candidatePhone: string;
  submittedAtISO: string;
  score: { correct: number; total: number; percent: number };
  answers: Record<string, number>;
  autoSubmitted: boolean;
}

// ── Simple radar chart using SVG ──────────────────────────────────────────────
function RadarChart({ scores }: { scores: Record<string, number> }) {
  const dims: PersonalityDimension[] = [
    'conscientiousness', 'extraversion', 'agreeableness',
    'emotional_stability', 'openness',
  ];
  const cx = 140, cy = 140, r = 100;
  const n = dims.length;

  const angleOf = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;

  const point = (i: number, pct: number) => {
    const a = angleOf(i);
    const d = (pct / 100) * r;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };

  const labelPoint = (i: number) => {
    const a = angleOf(i);
    const d = r + 22;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };

  // Grid rings
  const rings = [20, 40, 60, 80, 100];

  const ringPath = (pct: number) =>
    dims.map((_, i) => {
      const { x, y } = point(i, pct);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + ' Z';

  const dataPath = dims.map((dim, i) => {
    const { x, y } = point(i, scores[dim] ?? 50);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-xs mx-auto">
      {/* Grid rings */}
      {rings.map((pct) => (
        <path key={pct} d={ringPath(pct)} fill="none" stroke="#374151" strokeWidth="0.5" />
      ))}
      {/* Axes */}
      {dims.map((_, i) => {
        const outer = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="#374151" strokeWidth="0.5" />;
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="rgba(74,222,128,0.15)" stroke="#4ade80" strokeWidth="2" />
      {/* Data points */}
      {dims.map((dim, i) => {
        const { x, y } = point(i, scores[dim] ?? 50);
        return <circle key={dim} cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="#4ade80" />;
      })}
      {/* Labels */}
      {dims.map((dim, i) => {
        const { x, y } = labelPoint(i);
        const info = DIMENSION_LABELS[dim];
        return (
          <text
            key={dim}
            x={x.toFixed(1)} y={y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="#9ca3af"
          >
            {info.emoji} {info.label}
          </text>
        );
      })}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="3" fill="#6b7280" />
    </svg>
  );
}

export default function Results() {
  const { testKey = 'iq' } = useParams<{ testKey: string }>();
  const navigate = useNavigate();
  const [result, setResult]           = useState<ResultPayload | null>(null);
  const [aptScores, setAptScores]     = useState<AptitudeScores | null>(null);
  const [animScore, setAnimScore]     = useState(0);
  const [animDims, setAnimDims]       = useState<Record<string, number>>({});

  const isAptitude = testKey === 'aptitude';

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`lastResult:${testKey}`);
      if (!stored) { navigate('/portal'); return; }
      const r: ResultPayload = JSON.parse(stored);
      setResult(r);

      // Animate main score
      let cur = 0;
      const end = r.score.percent;
      const step = Math.max(1, Math.ceil(end / 40));
      const t1 = setInterval(() => {
        cur = Math.min(cur + step, end);
        setAnimScore(cur);
        if (cur >= end) clearInterval(t1);
      }, 30);

      // Aptitude-specific scoring
      if (isAptitude && r.answers) {
        const scores = scoreAptitude(r.answers);
        setAptScores(scores);

        // Animate radar dims
        const dims: Record<string, number> = {};
        Object.keys(scores.personality).forEach((k) => (dims[k] = 0));
        setAnimDims(dims);

        setTimeout(() => {
          let frame = 0;
          const t2 = setInterval(() => {
            frame++;
            const pct = Math.min(frame / 30, 1);
            const eased = 1 - Math.pow(1 - pct, 3);
            const next: Record<string, number> = {};
            Object.entries(scores.personality).forEach(([k, v]) => {
              next[k] = Math.round(v * eased);
            });
            setAnimDims(next);
            if (frame >= 30) clearInterval(t2);
          }, 40);
        }, 400);
      }

      return () => clearInterval(t1);
    } catch {
      navigate('/portal');
    }
  }, [testKey, navigate, isAptitude]);

  if (!result) return null;

  const { label, color, description } = isAptitude && aptScores
    ? getScoreLabel(aptScores.aptitudePercent)
    : getScoreLabel(result.score.percent);

  const displayScore = isAptitude && aptScores ? aptScores.aptitudePercent : result.score.percent;

  const testTitle: Record<string, string> = {
    iq:       'Intelligence Test',
    english:  'English Proficiency Test',
    aptitude: 'Aptitude & Personality Test',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-xs">MA</div>
          <span className="text-gray-400 text-sm tracking-widest uppercase">{testTitle[testKey] ?? 'Assessment'} — Complete</span>
        </div>
        <span className="text-xs text-gray-600 font-mono">{result.testKey}</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-6">

          {/* Score ring */}
          {isAptitude ? (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Work Aptitude Score</p>
              <div className="text-6xl font-black mb-1" style={{ color }}>{animScore}<span className="text-2xl text-gray-500">/100</span></div>
              <div className="text-xl font-black mb-1" style={{ color }}>{label}</div>
              <p className="text-gray-400 text-sm mb-4">{description}</p>
              <div className="flex items-center justify-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-black text-white">{aptScores?.aptitudeCorrect ?? 0}</div>
                  <div className="text-xs text-gray-500 uppercase">Correct</div>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div>
                  <div className="text-2xl font-black text-gray-500">
                    {(aptScores?.aptitudeTotal ?? 15) - (aptScores?.aptitudeCorrect ?? 0)}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">Incorrect</div>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div>
                  <div className="text-2xl font-black text-white">{aptScores?.aptitudeTotal ?? 15}</div>
                  <div className="text-xs text-gray-500 uppercase">Total</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center bg-gray-900 border border-gray-800 rounded-3xl p-10">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Your Score</p>
              <div className="relative w-44 h-44 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#1f2937" strokeWidth="12" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - animScore / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{animScore}</span>
                  <span className="text-gray-500 text-sm">/ 100</span>
                </div>
              </div>
              <div className="text-2xl font-black mb-1" style={{ color }}>{label}</div>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          )}

          {/* Personality Radar — shown to candidate */}
          {isAptitude && aptScores && (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 text-center font-medium">
                Personality Profile
              </p>
              <p className="text-xs text-gray-600 text-center mb-6">
                Your workplace personality dimensions
              </p>

              <RadarChart scores={animDims} />

              {/* Dimension bars */}
              <div className="flex flex-col gap-3 mt-6">
                {(Object.entries(DIMENSION_LABELS) as [PersonalityDimension, typeof DIMENSION_LABELS[PersonalityDimension]][]).map(([dim, info]) => {
                  const val = animDims[dim] ?? 0;
                  return (
                    <div key={dim}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300 font-medium">
                          {info.emoji} {info.label}
                        </span>
                        <span className="text-sm font-bold text-green-400">{val}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-700"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{info.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thank you */}
          <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-xl font-black text-white mb-2">
              Thank you{result.candidateName ? `, ${result.candidateName.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-2">
              Your assessment has been successfully submitted to{' '}
              <strong className="text-green-400">MA CENTER</strong>.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Our recruitment team will review your complete results and contact you with next steps.
            </p>
            {result.candidateEmail && (
              <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-400">
                📧 Submitted by: <span className="text-green-400 font-medium">{result.candidateEmail}</span>
              </div>
            )}
          </div>

          {/* What happens next */}
          {isAptitude && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">What happens next?</p>
              <div className="flex flex-col gap-3 text-sm text-gray-400">
                {[
                  { icon: '📊', text: 'MA CENTER receives your full assessment report including role fit analysis.' },
                  { icon: '👥', text: 'Our recruitment team reviews your results within 3–5 business days.' },
                  { icon: '📬', text: 'You will be contacted via email with the outcome and next steps.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/portal')}
            className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold transition-all"
          >
            ← Back to Portal
          </button>
        </div>
      </main>

      <footer className="border-t border-gray-800 px-6 py-4 text-center text-xs text-gray-600">
        © 2025 Browave Corporation · MA2.0 Program · 🇵🇭 Philippines Recruitment
      </footer>
    </div>
  );
}














