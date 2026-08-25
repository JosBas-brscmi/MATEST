import type { Handler } from '@netlify/functions';

type Payload = {
  testKey: string;
  testType: string;
  candidateEmail: string;
  candidateName: string;
  candidateSchool: string;
  candidateCourse: string;
  candidatePhone: string;
  submittedAtISO: string;
  score: { correct: number; total: number; percent: number };
  answers: Record<string, number>;
  autoSubmitted: boolean;
};

// ── Personality scoring (mirrors aptitudeBank.ts logic) ───────────────────────
type PersonalityDimension = 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotional_stability' | 'openness';

interface PersonalityScores { [key: string]: number }

const PERSONALITY_IDS: Record<string, { dim: PersonalityDimension; reverse?: boolean }> = {
  p01: { dim: 'conscientiousness' },
  p02: { dim: 'conscientiousness' },
  p03: { dim: 'conscientiousness', reverse: true },
  p04: { dim: 'extraversion' },
  p05: { dim: 'extraversion' },
  p06: { dim: 'extraversion', reverse: true },
  p07: { dim: 'agreeableness' },
  p08: { dim: 'agreeableness' },
  p09: { dim: 'agreeableness', reverse: true },
  p10: { dim: 'emotional_stability' },
  p11: { dim: 'emotional_stability' },
  p12: { dim: 'emotional_stability', reverse: true },
  p13: { dim: 'openness' },
  p14: { dim: 'openness' },
  p15: { dim: 'openness', reverse: true },
};

const WORK_APTITUDE_ANSWERS: Record<string, number> = {
  wa01: 1, wa02: 2, wa03: 2, wa04: 2, wa05: 2,
  wa06: 2, wa07: 2, wa08: 1, wa09: 2, wa10: 1,
  wa11: 2, wa12: 2, wa13: 2, wa14: 1, wa15: 2,
};

function computeAptitudeReport(answers: Record<string, number>) {
  // Work aptitude score
  let aptCorrect = 0;
  for (const [id, correct] of Object.entries(WORK_APTITUDE_ANSWERS)) {
    if (answers[id] === correct) aptCorrect++;
  }
  const aptPercent = Math.round((aptCorrect / 15) * 100);

  // Personality scores
  const dimAccum: Record<string, number[]> = {
    conscientiousness: [], extraversion: [], agreeableness: [],
    emotional_stability: [], openness: [],
  };
  for (const [id, cfg] of Object.entries(PERSONALITY_IDS)) {
    const raw = answers[id];
    if (raw === undefined) continue;
    const score = cfg.reverse ? (4 - raw) : raw;
    dimAccum[cfg.dim].push(score);
  }

  const personality: PersonalityScores = {};
  for (const [dim, scores] of Object.entries(dimAccum)) {
    if (scores.length === 0) { personality[dim] = 50; continue; }
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    personality[dim] = Math.round((avg / 4) * 100);
  }

  // ── Role scoring: weighted score per role, always return exactly top 3 ──
  const p = personality;
  const C = p.conscientiousness ?? 50;
  const E = p.extraversion      ?? 50;
  const A = p.agreeableness     ?? 50;
  const S = p.emotional_stability ?? 50;
  const O = p.openness          ?? 50;

  const roleScores: { dept: string; fn: string; score: number }[] = [
    { dept: 'Administration/ADM',                fn: 'Administration',       score: C*0.40 + S*0.35 + A*0.25 },
    { dept: 'Administration/ADM',                fn: 'Human Resource',       score: A*0.40 + E*0.35 + S*0.25 },
    { dept: 'Financial Accounting/FA',           fn: 'Financial Accounting', score: C*0.55 + S*0.35 + (100-O)*0.10 },
    { dept: 'Marketing Sales/MS',                fn: 'Sales',                score: E*0.45 + A*0.30 + S*0.25 },
    { dept: 'Marketing Sales/MS',                fn: 'Customer Service',     score: A*0.50 + S*0.30 + E*0.20 },
    { dept: 'Material Resource/MR',              fn: 'I/E Custom',           score: C*0.45 + O*0.30 + S*0.25 },
    { dept: 'Material Resource/MR',              fn: 'Supply Chain',         score: C*0.50 + S*0.35 + A*0.15 },
    { dept: 'Production & Material Control/PMC', fn: 'Production Control',   score: C*0.50 + S*0.40 + A*0.10 },
    { dept: 'Production & Material Control/PMC', fn: 'Material Control',     score: C*0.45 + A*0.30 + S*0.25 },
    { dept: 'Quality Assurance/QA',              fn: 'Quality Control',      score: C*0.55 + S*0.30 + (100-E)*0.15 },
    { dept: 'Quality Assurance/QA',              fn: 'Quality Engineering',  score: C*0.45 + O*0.35 + S*0.20 },
    { dept: 'Production Technology/PT',          fn: 'Process',              score: O*0.45 + C*0.35 + S*0.20 },
    { dept: 'Production Technology/PT',          fn: 'Equipment',            score: C*0.40 + O*0.35 + S*0.25 },
    { dept: 'Production Management/PM',          fn: 'Production Management',score: E*0.35 + C*0.40 + A*0.25 },
    { dept: 'Manufacturing Information/MI',      fn: 'Software',             score: O*0.50 + C*0.35 + S*0.15 },
    { dept: 'Manufacturing Information/MI',      fn: 'Hardware',             score: O*0.40 + C*0.40 + S*0.20 },
    { dept: 'Industrial Engineering/IE',         fn: 'Industrial Engineering',score: O*0.40 + C*0.40 + S*0.20 },
    { dept: 'Facilities Service/FS',             fn: 'Facilities Service',   score: C*0.35 + A*0.35 + S*0.30 },
  ];

  // Sort descending by score, take top 3
  roleScores.sort((a, b) => b.score - a.score);
  const top3 = roleScores.slice(0, 3);
  const recommendedRoles = top3.map(r => `${r.dept} - ${r.fn}`);

  return { aptCorrect, aptPercent, personality, roles: recommendedRoles, recommendedRoles };
}

// ── Score label ───────────────────────────────────────────────────────────────
function getScoreLabel(percent: number): string {
  if (percent >= 90) return 'Exceptional';
  if (percent >= 75) return 'Above Average';
  if (percent >= 60) return 'Average';
  if (percent >= 40) return 'Below Average';
  return 'Developing';
}

function getSiteUrl() {
  return process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || '';
}

// ── Build comprehensive FINAL email (all 3 tests) ────────────────────────────
function buildFinalEmailHtml(
  payload: Payload,
  allScores: { iq?: any; english?: any; aptitude?: any }
): string {
  const submittedAt = new Date(payload.submittedAtISO).toLocaleString('en-PH', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Manila',
  });

  const scoreRow = (label: string, color: string, pct: number | null, correct: number | null, total: number | null) => {
    if (pct === null) return '';
    const band = getScoreLabel(pct);
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
    return `
      <div style="background:#1e293b;border-radius:10px;padding:16px;margin:10px 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:13px;font-weight:bold;color:#e2e8f0;">${label}</span>
          <span style="background:${color};color:white;font-size:11px;font-weight:bold;padding:2px 10px;border-radius:99px;">${band}</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:28px;font-weight:900;color:${color};">${pct}%</span>
          <div>
            <div style="color:#64748b;font-family:monospace;font-size:11px;">${bar}</div>
            <div style="color:#94a3b8;font-size:11px;margin-top:2px;">${correct} / ${total} correct</div>
          </div>
        </div>
      </div>`;
  };

  const aptReport = payload.answers ? computeAptitudeReport(payload.answers) : null;
  const dimLabels: Record<string, string> = {
    conscientiousness:   'Conscientiousness',
    extraversion:        'Extraversion',
    agreeableness:       'Agreeableness',
    emotional_stability: 'Emotional Stability',
    openness:            'Openness',
  };

  const personalityRows = aptReport ? Object.entries(aptReport.personality).map(([dim, val]) => {
    const bar = '█'.repeat(Math.round((val as number) / 10)) + '░'.repeat(10 - Math.round((val as number) / 10));
    return `<tr>
      <td style="padding:5px 0;color:#94a3b8;font-size:12px;width:160px;">${dimLabels[dim] ?? dim}</td>
      <td style="padding:5px 0;color:#4ade80;font-family:monospace;font-size:11px;">${bar} ${val}%</td>
    </tr>`;
  }).join('') : '';

  // Build recommended roles table from 18-role definition
  const ALL_ROLES = [
    { no: 1,  dept: 'Administration/ADM',                fn: 'Administration'        },
    { no: 2,  dept: 'Administration/ADM',                fn: 'Human Resource'         },
    { no: 3,  dept: 'Financial Accounting/FA',           fn: 'Financial Accounting'   },
    { no: 4,  dept: 'Marketing Sales/MS',                fn: 'Sales'                  },
    { no: 5,  dept: 'Marketing Sales/MS',                fn: 'Customer Service'       },
    { no: 6,  dept: 'Material Resource/MR',              fn: 'I/E Custom'             },
    { no: 7,  dept: 'Material Resource/MR',              fn: 'Supply Chain'           },
    { no: 8,  dept: 'Production & Material Control/PMC', fn: 'Production Control'     },
    { no: 9,  dept: 'Production & Material Control/PMC', fn: 'Material Control'       },
    { no: 10, dept: 'Quality Assurance/QA',              fn: 'Quality Control'        },
    { no: 11, dept: 'Quality Assurance/QA',              fn: 'Quality Engineering'    },
    { no: 12, dept: 'Production Technology/PT',          fn: 'Process'                },
    { no: 13, dept: 'Production Technology/PT',          fn: 'Equipment'              },
    { no: 14, dept: 'Production Management/PM',          fn: 'Production Management'  },
    { no: 15, dept: 'Manufacturing Information/MI',      fn: 'Software'               },
    { no: 16, dept: 'Manufacturing Information/MI',      fn: 'Hardware'               },
    { no: 17, dept: 'Industrial Engineering/IE',         fn: 'Industrial Engineering' },
    { no: 18, dept: 'Facilities Service/FS',             fn: 'Facilities Service'     },
  ];

  // Top 3 recommended roles from aptReport (always exactly 3)
  const top3Keys = new Set<string>(aptReport?.recommendedRoles ?? aptReport?.roleRecommendation ?? []);

  const rolesTableRows = ALL_ROLES.map((role, idx) => {
    const key = `${role.dept} - ${role.fn}`;
    // Check if this role is in top 3
    const isTop3 = Array.from(top3Keys).some(r => r === key);
    // Rank label for top 3
    const top3List = Array.from(top3Keys);
    const rank = top3List.findIndex(r => r === key);
    const rankLabel = rank >= 0 ? `#${rank + 1}` : '';

    return `<tr style="background:${isTop3 ? '#064e3b' : (idx % 2 === 0 ? '#0f172a' : '#1e293b')}">
      <td style="padding:6px 8px;color:${isTop3 ? '#6ee7b7' : '#64748b'};font-size:11px;border:1px solid #1e293b;text-align:center;font-weight:${isTop3 ? 'bold' : 'normal'};">${role.no}</td>
      <td style="padding:6px 8px;color:${isTop3 ? '#6ee7b7' : '#94a3b8'};font-size:11px;border:1px solid #1e293b;font-weight:${isTop3 ? 'bold' : 'normal'};">${role.dept}${isTop3 ? ` <span style="background:#059669;color:white;font-size:9px;padding:1px 6px;border-radius:99px;margin-left:4px;">${rankLabel}</span>` : ''}</td>
      <td style="padding:6px 8px;color:${isTop3 ? '#6ee7b7' : '#94a3b8'};font-size:11px;border:1px solid #1e293b;font-weight:${isTop3 ? 'bold' : 'normal'};">${role.fn}</td>
    </tr>`;
  }).join('');

  const rolesHtml = `<table style="width:100%;border-collapse:collapse;margin-top:4px;">
    <tr style="background:#0a1628;">
      <th style="padding:7px 8px;color:#64748b;font-size:10px;text-align:center;border:1px solid #1e293b;text-transform:uppercase;width:32px;">#</th>
      <th style="padding:7px 8px;color:#64748b;font-size:10px;text-align:left;border:1px solid #1e293b;text-transform:uppercase;">Department Name</th>
      <th style="padding:7px 8px;color:#64748b;font-size:10px;text-align:left;border:1px solid #1e293b;text-transform:uppercase;">Function Name</th>
    </tr>
    ${rolesTableRows}
  </table>`;

  const iqPct  = allScores.iq?.score_percent      ?? null;
  const enPct  = allScores.english?.score_percent ?? null;
  const aptPct = payload.score?.percent            ?? null;

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:14px;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0a1e4a 0%,#0d2a5e 100%);padding:28px 32px;border-bottom:3px solid #10b981;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td>
            <div style="font-size:20px;font-weight:900;letter-spacing:3px;color:white;">BROWAVE <span style="color:#34d399;">MATTA</span></div>
            <div style="font-size:10px;color:#94b4d4;letter-spacing:2px;margin-top:3px;text-transform:uppercase;">Final Assessment Report</div>
          </td>
          <td style="text-align:right;">
            <div style="font-size:11px;color:#94b4d4;">${submittedAt}</div>
            <div style="font-size:10px;color:#64748b;margin-top:2px;">General Ability Test (GAT)</div>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding:28px 32px;">

      <!-- Candidate info -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#1e293b;border-radius:10px;overflow:hidden;">
        <tr><td colspan="2" style="padding:12px 16px 6px;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:bold;">Candidate Information</td></tr>
        ${[
          ['Name',   payload.candidateName],
          ['Email',  payload.candidateEmail],
          ['Phone',  payload.candidatePhone],
          ['School', payload.candidateSchool],
          ['Course', payload.candidateCourse],
        ].filter(([,v]) => v).map(([k, v]) => `
        <tr>
          <td style="padding:6px 16px;color:#64748b;font-size:12px;width:80px;">${k}</td>
          <td style="padding:6px 16px;color:#e2e8f0;font-size:12px;font-weight:bold;">${v}</td>
        </tr>`).join('')}
        <tr><td colspan="2" style="padding:12px 16px;"></td></tr>
      </table>

      <!-- Overall score summary pills -->
      <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
        ${iqPct  !== null ? `<div style="background:#1e3a8a;border-radius:10px;padding:12px 20px;text-align:center;min-width:90px;"><div style="font-size:26px;font-weight:900;color:#60a5fa;">${iqPct}%</div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">IQ</div></div>` : ''}
        ${enPct  !== null ? `<div style="background:#3b0764;border-radius:10px;padding:12px 20px;text-align:center;min-width:90px;"><div style="font-size:26px;font-weight:900;color:#c084fc;">${enPct}%</div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">English</div></div>` : ''}
        ${aptPct !== null ? `<div style="background:#064e3b;border-radius:10px;padding:12px 20px;text-align:center;min-width:90px;"><div style="font-size:26px;font-weight:900;color:#4ade80;">${aptPct}%</div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Aptitude</div></div>` : ''}
      </div>

      <!-- Detailed scores -->
      <p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;font-weight:bold;">Assessment Results</p>
      ${scoreRow('I. Cognitive IQ Test',        '#3b82f6', iqPct,
          allScores.iq?.score_correct  ?? null, allScores.iq?.score_total  ?? 25)}
      ${scoreRow('II. English Proficiency',      '#a855f7', enPct,
          allScores.english?.score_correct ?? null, allScores.english?.score_total ?? 25)}
      ${scoreRow('III. Work Aptitude',           '#10b981', aptPct,
          payload.score?.correct ?? null, payload.score?.total ?? 15)}

      ${aptReport ? `
      <!-- Personality profile -->
      <div style="background:#1e293b;border-radius:10px;padding:18px;margin:16px 0;">
        <p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;font-weight:bold;">Personality Profile</p>
        <table style="width:100%;border-collapse:collapse;">${personalityRows}</table>
      </div>
      <!-- Recommended Role Table (18 roles, matched ones highlighted) -->
      <div style="background:#1e293b;border-radius:10px;padding:18px;margin:16px 0;">
        <p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;font-weight:bold;">Recommended Role for This Candidate</p>
        <p style="color:#94a3b8;font-size:10px;margin:0 0 10px;">Highlighted rows indicate recommended roles based on personality assessment.</p>
        ${rolesHtml}
      </div>` : ''}

    </div>

    <!-- Footer -->
    <div style="background:#020c1f;padding:16px 32px;text-align:center;border-top:1px solid #1e293b;">
      <p style="color:#334155;font-size:10px;margin:0;letter-spacing:1px;">
        BROWAVE Corporation &nbsp;·&nbsp; MA2.0 Program &nbsp;·&nbsp; Philippines Recruitment
      </p>
    </div>
  </div>`;
}

// ── Fetch previous results from Supabase ──────────────────────────────────────
async function fetchPreviousResults(candidateEmail: string): Promise<{ iq?: any; english?: any }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return {};

  try {
    const r = await fetch(
      `${url}/rest/v1/matta_results?candidate_email=eq.${encodeURIComponent(candidateEmail)}&order=submitted_at.desc&limit=10`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!r.ok) return {};
    const rows: any[] = await r.json();
    const result: { iq?: any; english?: any } = {};
    for (const row of rows) {
      if (row.test_type === 'iq'      && !result.iq)      result.iq      = row;
      if (row.test_type === 'english' && !result.english) result.english = row;
    }
    return result;
  } catch { return {}; }
}

// ── Resend — final comprehensive email ───────────────────────────────────────
async function sendEmailViaResend(payload: Payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'No RESEND_API_KEY' };

  const notifyEmail = process.env.NOTIFY_EMAIL || 'browave.matta@browave.com';
  const fromDomain  = process.env.RESEND_FROM_DOMAIN || 'onboarding@resend.dev';

  // Fetch IQ and English results from Supabase
  const prev = await fetchPreviousResults(payload.candidateEmail);
  const allScores = { iq: prev.iq, english: prev.english, aptitude: payload };

  const iqPct  = prev.iq?.score_percent       ?? null;
  const enPct  = prev.english?.score_percent  ?? null;
  const aptPct = payload.score?.percent        ?? 0;

  const html = buildFinalEmailHtml(payload, allScores);

  // ── Build plain text PDF attachment (data URI approach via jsPDF output) ──
  // We generate a simple CSV summary as attachment since jsPDF runs in browser only
  const aptReport = payload.answers ? computeAptitudeReport(payload.answers) : null;
  const top3ForCsv = new Set<string>(aptReport?.recommendedRoles ?? aptReport?.roleRecommendation ?? []);
  const isRec = (dept: string, fn: string) =>
    top3ForCsv.has(`${dept} - ${fn}`) ? 'YES' : '';

  const csvLines = [
    'BROWAVE MATTA - Assessment Report',
    `Candidate,${payload.candidateName}`,
    `Email,${payload.candidateEmail}`,
    `Phone,${payload.candidatePhone}`,
    `School,${payload.candidateSchool}`,
    `Course,${payload.candidateCourse}`,
    `Date,${new Date(payload.submittedAtISO).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`,
    '',
    'Assessment Results',
    `IQ Test,${iqPct !== null ? iqPct + '%' : 'Not completed'},${iqPct !== null ? getScoreLabel(iqPct) : ''}`,
    `English Test,${enPct !== null ? enPct + '%' : 'Not completed'},${enPct !== null ? getScoreLabel(enPct) : ''}`,
    `Aptitude Test,${aptPct}%,${getScoreLabel(aptPct)}`,
    '',
    'Personality Profile',
    ...(aptReport ? Object.entries(aptReport.personality).map(([k, v]) => `${k},${v}%`) : []),
    '',
    'Recommended Role for This Candidate (Top 3 highlighted)',
    'No,Department Name,Function Name,Recommended',
    `1,Administration/ADM,Administration,${isRec('Administration/ADM','Administration')}`,
    `2,Administration/ADM,Human Resource,${isRec('Administration/ADM','Human Resource')}`,
    `3,Financial Accounting/FA,Financial Accounting,${isRec('Financial Accounting/FA','Financial Accounting')}`,
    `4,Marketing Sales/MS,Sales,${isRec('Marketing Sales/MS','Sales')}`,
    `5,Marketing Sales/MS,Customer Service,${isRec('Marketing Sales/MS','Customer Service')}`,
    `6,Material Resource/MR,I/E Custom,${isRec('Material Resource/MR','I/E Custom')}`,
    `7,Material Resource/MR,Supply Chain,${isRec('Material Resource/MR','Supply Chain')}`,
    `8,Production & Material Control/PMC,Production Control,${isRec('Production & Material Control/PMC','Production Control')}`,
    `9,Production & Material Control/PMC,Material Control,${isRec('Production & Material Control/PMC','Material Control')}`,
    `10,Quality Assurance/QA,Quality Control,${isRec('Quality Assurance/QA','Quality Control')}`,
    `11,Quality Assurance/QA,Quality Engineering,${isRec('Quality Assurance/QA','Quality Engineering')}`,
    `12,Production Technology/PT,Process,${isRec('Production Technology/PT','Process')}`,
    `13,Production Technology/PT,Equipment,${isRec('Production Technology/PT','Equipment')}`,
    `14,Production Management/PM,Production Management,${isRec('Production Management/PM','Production Management')}`,
    `15,Manufacturing Information/MI,Software,${isRec('Manufacturing Information/MI','Software')}`,
    `16,Manufacturing Information/MI,Hardware,${isRec('Manufacturing Information/MI','Hardware')}`,
    `17,Industrial Engineering/IE,Industrial Engineering,${isRec('Industrial Engineering/IE','Industrial Engineering')}`,
    `18,Facilities Service/FS,Facilities Service,${isRec('Facilities Service/FS','Facilities Service')}`,
  ];
  const csvContent = csvLines.join('\n');
  const csvB64 = Buffer.from(csvContent, 'utf8').toString('base64');

  const safeName = (payload.candidateName || 'Candidate').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `MATTA Assessment <${fromDomain}>`,
      to:   [notifyEmail],
      subject: `[MATTA] Final Report — ${payload.candidateName} | IQ: ${iqPct ?? '—'}% | EN: ${enPct ?? '—'}% | APT: ${aptPct}%`,
      html,
      attachments: [
        {
          filename: `MATTA_Report_${safeName}.csv`,
          content:  csvB64,
        },
      ],
    }),
  });

  if (!r.ok) throw new Error(`Resend error: ${r.status} ${await r.text()}`);
  return { skipped: false };
}

// ── Supabase ──────────────────────────────────────────────────────────────────
async function insertSupabase(payload: Payload) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { skipped: true };

  const aptReport = payload.testType === 'aptitude' && payload.answers
    ? computeAptitudeReport(payload.answers)
    : null;

  const r = await fetch(`${url}/rest/v1/matta_results`, {
    method: 'POST',
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    },
    body: JSON.stringify([{
      test_key:         payload.testKey,
      test_type:        payload.testType,
      candidate_email:  payload.candidateEmail,
      candidate_name:   payload.candidateName,
      candidate_school: payload.candidateSchool,
      candidate_course: payload.candidateCourse,
      candidate_phone:  payload.candidatePhone,
      submitted_at:     payload.submittedAtISO,
      score_percent:    payload.score.percent,
      score_correct:    payload.score.correct,
      score_total:      payload.score.total,
      auto_submitted:   payload.autoSubmitted,
      apt_report:       aptReport,
      payload_json:     payload,
    }]),
  });

  if (!r.ok) throw new Error(`Supabase error: ${r.status} ${await r.text()}`);
  return { skipped: false };
}

// ── Netlify Forms ─────────────────────────────────────────────────────────────
async function postToNetlifyForms(payload: Payload) {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return { skipped: true };

  const params = new URLSearchParams();
  params.append('form-name',     'matta-results');
  params.append('candidateEmail', payload.candidateEmail ?? '');
  params.append('candidateName',  payload.candidateName  ?? '');
  params.append('testKey',        payload.testKey        ?? '');
  params.append('testType',       payload.testType       ?? '');
  params.append('submittedAtISO', payload.submittedAtISO ?? '');
  params.append('scorePercent',   String(payload.score?.percent ?? ''));
  params.append('scoreCorrect',   String(payload.score?.correct ?? ''));
  params.append('scoreTotal',     String(payload.score?.total   ?? ''));
  params.append('autoSubmitted',  String(payload.autoSubmitted));
  params.append('payloadJson',    JSON.stringify(payload));

  const r = await fetch(`${siteUrl}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!r.ok) throw new Error(`Netlify Forms: ${r.status}`);
  return { skipped: false };
}

// ── Handler ───────────────────────────────────────────────────────────────────
export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const payload: Payload = JSON.parse(event.body || '{}');
    console.log('[submitResult] received:', payload.testType, payload.candidateEmail);

    if (!payload.testKey || !payload.candidateEmail || !payload.submittedAtISO) {
      console.log('[submitResult] missing required fields');
      return { statusCode: 400, body: 'Missing required fields.' };
    }

    // Always save to Supabase and Netlify Forms
    const [supabaseResult, formsResult] = await Promise.allSettled([
      insertSupabase(payload),
      postToNetlifyForms(payload),
    ]);

    // Only send email when ALL THREE tests are done (aptitude = final test)
    let emailResult: PromiseSettledResult<any> = { status: 'fulfilled', value: { skipped: true, reason: 'Not final test' } };

    if (payload.testType === 'aptitude') {
      console.log('[submitResult] aptitude submitted — sending final summary email');
      const emailSettled = await Promise.allSettled([sendEmailViaResend(payload)]);
      emailResult = emailSettled[0];
    } else {
      console.log('[submitResult] test type:', payload.testType, '— skipping email (will send after aptitude)');
    }

    // Log results
    console.log('[supabase]', supabaseResult.status,
      supabaseResult.status === 'rejected' ? (supabaseResult as any).reason?.message : 'ok');
    console.log('[email]', emailResult.status,
      emailResult.status === 'rejected' ? (emailResult as any).reason?.message : 'ok');
    console.log('[forms]', formsResult.status,
      formsResult.status === 'rejected' ? (formsResult as any).reason?.message : 'ok');

    const responseBody = {
      ok: true,
      supabase: supabaseResult.status,
      email:    emailResult.status,
      forms:    formsResult.status,
    };
    console.log('[submitResult] done:', JSON.stringify(responseBody));

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (e: any) {
    console.error('[submitResult] fatal error:', e?.message ?? e);
    return { statusCode: 500, body: String(e?.message ?? e) };
  }
};

