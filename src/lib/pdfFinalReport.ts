import { jsPDF } from 'jspdf';

// ── MATTA Logo (JPEG) ─────────────────────────────────────────────────────────
const LOGO_B64 = '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';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy:      [8,   25,  58]  as number[],   // deep header bg
  navyMid:   [15,  40,  85]  as number[],
  accent:    [16,  185, 129] as number[],   // emerald
  purple:    [124, 58,  237] as number[],
  blue:      [30,  58,  138] as number[],
  lightBg:   [245, 248, 255] as number[],
  cardBg:    [237, 242, 255] as number[],
  midGray:   [220, 228, 245] as number[],
  textDark:  [20,  30,  60]  as number[],
  textMid:   [60,  80,  120] as number[],
  textLight: [130, 150, 190] as number[],
  white:     [255, 255, 255] as number[],
  divider:   [200, 215, 240] as number[],
};

const sf = (d: any, c: number[]) => d.setFillColor(c[0], c[1], c[2]);
const sd = (d: any, c: number[]) => d.setDrawColor(c[0], c[1], c[2]);
const st = (d: any, c: number[]) => d.setTextColor(c[0], c[1], c[2]);

function scoreBand(pct: number): { label: string; color: number[] } {
  if (pct >= 90) return { label: 'Exceptional',   color: [5,   150, 105] };
  if (pct >= 75) return { label: 'Above Average', color: [37,  99,  235] };
  if (pct >= 60) return { label: 'Average',       color: [180, 120, 0  ] };
  if (pct >= 40) return { label: 'Below Average', color: [220, 80,  20 ] };
  return               { label: 'Developing',    color: [200, 40,  40 ] };
}

function hBar(doc: any, x: number, y: number, w: number, pct: number, color: number[]) {
  // background
  sf(doc, C.midGray); doc.roundedRect(x, y, w, 3.5, 1.5, 1.5, 'F');
  // fill
  const fillW = Math.max(3, w * pct / 100);
  sf(doc, color);     doc.roundedRect(x, y, fillW, 3.5, 1.5, 1.5, 'F');
}

function drawRadar(
  doc: any, cx: number, cy: number, r: number,
  vals: number[], shortLabels: string[], color: number[]
) {
  const n = vals.length;
  sd(doc, C.midGray); doc.setLineWidth(0.25);
  for (let ring = 1; ring <= 4; ring++) {
    const rr = r * ring / 4;
    for (let i = 0; i < n; i++) {
      const a0 = (i * 2 * Math.PI) / n - Math.PI / 2;
      const a1 = ((i + 1) * 2 * Math.PI) / n - Math.PI / 2;
      doc.line(cx + rr * Math.cos(a0), cy + rr * Math.sin(a0),
               cx + rr * Math.cos(a1), cy + rr * Math.sin(a1));
    }
  }
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    doc.line(cx, cy, cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  // data polygon
  const pts = vals.map((v, i) => {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    const d = r * (v || 0) / 100;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  });
  sd(doc, color); doc.setLineWidth(0.8);
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    doc.line(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
  }
  sf(doc, color);
  pts.forEach(p => doc.circle(p.x, p.y, 1.2, 'F'));
  // labels
  doc.setFontSize(6.5); st(doc, C.textMid); doc.setFont('helvetica', 'bold');
  shortLabels.forEach((lbl, i) => {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    doc.text(lbl, cx + (r + 13) * Math.cos(a), cy + (r + 13) * Math.sin(a),
             { align: 'center', baseline: 'middle' });
  });
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function downloadFinalPdf(bundle: any) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210, PH = 297, ML = 18, MR = 18, CW = PW - ML - MR;

  // ── helpers ──
  const get = (key: string) =>
    bundle.iq?.[key] || bundle.english?.[key] || bundle.aptitude?.[key] || '';

  const name    = get('candidateName')   || 'Candidate';
  const email   = get('candidateEmail')  || '—';
  const school  = get('candidateSchool') || '—';
  const course  = get('candidateCourse') || '—';
  const phone   = get('candidatePhone')  || '—';

  const iso = get('submittedAtISO') || new Date().toISOString();
  const dt  = new Date(iso);
  const dateStr = dt.toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric', timeZone:'Asia/Manila' });
  const timeStr = dt.toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Manila', hour12:true });

  // ════════════════════════════════════════
  //  HEADER — dark navy band
  // ════════════════════════════════════════
  const HDR_H = 58;
  sf(doc, C.navy); doc.rect(0, 0, PW, HDR_H, 'F');
  // accent bottom stripe
  sf(doc, C.accent); doc.rect(0, HDR_H - 2, PW, 2, 'F');

  // Logo — left side, vertically centred in header
  try {
    const LOGO_SIZE = 30;
    const logoY = (HDR_H - 2 - LOGO_SIZE) / 2;
    doc.addImage(`data:image/jpeg;base64,${LOGO_B64}`, 'JPEG', ML, logoY, LOGO_SIZE, LOGO_SIZE);
  } catch { /* skip */ }

  // Title block — right of logo
  const TX = ML + 35;
  // BROWAVE MATTA — large condensed style
  st(doc, C.white);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text('BROWAVE', TX, 18);
  st(doc, [52, 211, 153]); // emerald-400
  doc.text('MATTA', TX + doc.getTextWidth('BROWAVE ') + 1, 18);

  // Subtitle
  st(doc, [148, 183, 220]);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text('PROFESSIONAL RECRUITMENT ASSESSMENT REPORT', TX, 25);

  // GAT badge
  st(doc, [52, 211, 153]);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
  doc.text('GENERAL ABILITY TEST (GAT)', TX, 32);

  // Generated date/time — top-right
  st(doc, [148, 183, 220]);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
  doc.text(`Generated: ${dateStr}`, PW - MR, 20, { align: 'right' });
  doc.text(timeStr + ' (PHT)', PW - MR, 27, { align: 'right' });

  // ════════════════════════════════════════
  //  CANDIDATE INFO CARD
  // ════════════════════════════════════════
  let Y = HDR_H + 8;

  sf(doc, C.lightBg); doc.roundedRect(ML, Y, CW, 34, 3, 3, 'F');
  sd(doc, C.divider); doc.setLineWidth(0.3); doc.roundedRect(ML, Y, CW, 34, 3, 3, 'S');
  sf(doc, C.accent);  doc.roundedRect(ML, Y, 3.5, 34, 1.5, 1.5, 'F');

  // Candidate name
  st(doc, C.textDark); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text(name, ML + 8, Y + 9);

  // Info grid — 2 columns, no overlapping
  const infoLeft = [
    ['Email',  email],
    ['School', school],
    ['Course', course],
  ];
  const infoRight = [
    ['Phone', phone],
    ['Date',  dateStr],
    ['Time',  timeStr + ' PHT'],
  ];

  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  let infoY = Y + 15;
  infoLeft.forEach(([lbl, val]) => {
    st(doc, C.textLight); doc.text(lbl + ':', ML + 8, infoY);
    st(doc, C.textDark);  doc.text(val, ML + 24, infoY);
    infoY += 6;
  });

  infoY = Y + 15;
  infoRight.forEach(([lbl, val]) => {
    st(doc, C.textLight); doc.text(lbl + ':', ML + CW / 2, infoY);
    st(doc, C.textDark);  doc.text(val, ML + CW / 2 + 14, infoY);
    infoY += 6;
  });

  // Score pills — top-right of header, below the generated date/time
  const pillData = [
    { lbl: 'IQ',       pct: bundle.iq?.score?.percent      ?? null, col: C.blue   },
    { lbl: 'English',  pct: bundle.english?.score?.percent ?? null, col: C.purple },
    { lbl: 'Aptitude', pct: bundle.aptitude?.score?.percent ?? null, col: C.accent },
  ];
  const PILL_Y = 34;   // top of the pill row, inside the header band
  const PILL_H = 15;   // pill height — a touch taller so both text lines breathe
  let px = PW - MR - 3;
  pillData.filter(p => p.pct !== null).reverse().forEach(({ lbl, pct, col }) => {
    const pw = 24;
    px -= pw + 2;
    sf(doc, col); doc.roundedRect(px, PILL_Y, pw, PILL_H, 2, 2, 'F');
    st(doc, C.white);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text(`${pct}%`, px + pw / 2, PILL_Y + 7, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5);
    doc.text(lbl.toUpperCase(), px + pw / 2, PILL_Y + 12, { align: 'center' });
  });

  Y += 42;

  // ── Section renderer ──────────────────────────────────────────────────────
  function section(title: string, sub: string, color: number[], y: number): number {
    sf(doc, color); doc.roundedRect(ML, y, 4, 9, 1.5, 1.5, 'F');
    st(doc, color); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text(title, ML + 7, y + 6.5);
    st(doc, C.textLight); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    const tw = doc.getTextWidth(title);
    doc.text(sub, ML + 7 + tw + 3, y + 6.5);
    return y + 13; // return Y after section header
  }

  function scoreBlock(
    doc: any, y: number, pct: number, correct: number, total: number,
    label: string, bgColor: number[], borderColor: number[]
  ): number {
    const bh = 20;
    sf(doc, bgColor);     doc.roundedRect(ML, y, CW, bh, 2, 2, 'F');
    sf(doc, borderColor); doc.roundedRect(ML, y, 3.5, bh, 1.5, 1.5, 'F');

    // big percent
    st(doc, C.textDark); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text(`${pct}%`, ML + 8, y + 12);

    const { label: band, color: bc } = scoreBand(pct);
    st(doc, bc); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(band, ML + 28, y + 8);

    st(doc, C.textMid); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.text(`${correct} / ${total} correct answers`, ML + 28, y + 14);

    hBar(doc, ML + 78, y + 8, 90, pct, bc);
    st(doc, C.textLight); doc.setFontSize(6.5);
    doc.text('0', ML + 78, y + 16);
    doc.text('100', ML + 78 + 90, y + 16, { align: 'right' });

    return y + bh + 6;
  }

  // ════════════════════════════════════════
  //  I. IQ TEST
  // ════════════════════════════════════════
  if (bundle.iq) {
    Y = section('I. COGNITIVE IQ TEST', '                — Intelligence Assessment', C.blue, Y);
    Y = scoreBlock(doc, Y,
      bundle.iq.score?.percent ?? 0,
      bundle.iq.score?.correct ?? 0,
      bundle.iq.score?.total   ?? 25,
      'IQ', [235, 242, 255], C.blue);
  }

  // ════════════════════════════════════════
  //  II. ENGLISH
  // ════════════════════════════════════════
  if (bundle.english) {
    Y = section('II. ENGLISH PROFICIENCY', '                    — Language Assessment', C.purple, Y);
    Y = scoreBlock(doc, Y,
      bundle.english.score?.percent ?? 0,
      bundle.english.score?.correct ?? 0,
      bundle.english.score?.total   ?? 25,
      'English', [245, 240, 255], C.purple);
  }

  // ════════════════════════════════════════
  //  III. APTITUDE & PERSONALITY
  // ════════════════════════════════════════
  if (bundle.aptitude) {
    Y = section('III. APTITUDE & PERSONALITY', '                        — Behavioural Assessment', C.accent, Y);
    scoreBlock(doc, Y,
      bundle.aptitude.score?.percent ?? 0,
      bundle.aptitude.score?.correct ?? 0,
      bundle.aptitude.score?.total   ?? 15,
      'Aptitude', [235, 252, 245], C.accent);
  }

  // ════════════════════════════════════════
  //  FOOTER — PAGE 1
  // ════════════════════════════════════════
  const drawFooter = (pageDoc: any) => {
    sf(pageDoc, C.navy); pageDoc.rect(0, PH - 12, PW, 12, 'F');
    sf(pageDoc, C.accent); pageDoc.rect(0, PH - 12, PW, 1.5, 'F');
    st(pageDoc, [100, 140, 190]);
    pageDoc.setFont('helvetica', 'normal'); pageDoc.setFontSize(7);
    pageDoc.text('BROWAVE Corporation   /   MA4.0 Program   /   Philippines Recruitment', ML, PH - 5);
    pageDoc.text('CONFIDENTIAL — For MA CENTER use only', PW - MR, PH - 5, { align: 'right' });
  };
  drawFooter(doc);

  // ════════════════════════════════════════
  //  PAGE 2 — PERSONALITY PROFILE
  // ════════════════════════════════════════
  if (bundle.aptitude) {
    doc.addPage();
    let Y2 = 15;

    // Page 2 header strip
    sf(doc, C.navy); doc.rect(0, 0, PW, 20, 'F');
    sf(doc, C.accent); doc.rect(0, 18, PW, 2, 'F');
    st(doc, C.white); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('BROWAVE', ML, 12);
    st(doc, [52, 211, 153]);
    doc.text('MATTA', ML + doc.getTextWidth('BROWAVE ') + 1, 12);
    st(doc, [148, 183, 220]); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text('PERSONALITY PROFILE  —  Page 2 of 2', PW - MR, 12, { align: 'right' });

    Y2 = 30;

    const aptReport2 = (bundle.aptitude as any).aptReport;
    const personality: Record<string, number> = aptReport2?.personality ?? {
      conscientiousness: 70, extraversion: 65, agreeableness: 72,
      emotional_stability: 68, openness: 75,
    };

    const dims = [
      { key: 'conscientiousness',   short: 'Conscient.',  label: 'Conscientiousness'   },
      { key: 'extraversion',        short: 'Extravert.',  label: 'Extraversion'         },
      { key: 'agreeableness',       short: 'Agreeable.',  label: 'Agreeableness'        },
      { key: 'emotional_stability', short: 'Stability',   label: 'Emotional Stability'  },
      { key: 'openness',            short: 'Openness',    label: 'Openness'             },
    ];

    // ── Section title ──
    st(doc, C.textDark); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('Personality Dimensions', ML, Y2);
    st(doc, C.textLight); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Based on workplace personality assessment (Big Five model)', ML, Y2 + 6);
    Y2 += 14;

    // ── Radar chart — centred, larger ──
    const radarCX2 = PW / 2;
    const radarCY2 = Y2 + 48;
    const radarR2  = 44;
    drawRadar(doc, radarCX2, radarCY2, radarR2,
      dims.map(d => personality[d.key] ?? 50),
      dims.map(d => d.short), C.accent);

    Y2 = radarCY2 + radarR2 + 22;

    // ── Dimension bars — full width ──
    dims.forEach(d => {
      const val = personality[d.key] ?? 50;
      const { label: band, color: bc } = scoreBand(val);

      sf(doc, C.lightBg); doc.roundedRect(ML, Y2, CW, 14, 2, 2, 'F');
      sf(doc, bc);        doc.roundedRect(ML, Y2, 3.5, 14, 1.5, 1.5, 'F');

      st(doc, C.textDark); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
      doc.text(d.label, ML + 8, Y2 + 9);

      st(doc, bc); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text(band, ML + CW / 2, Y2 + 9, { align: 'center' });

      st(doc, bc); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text(`${val}%`, PW - MR - 3, Y2 + 9, { align: 'right' });

      hBar(doc, ML + 8, Y2 + 10.5, CW - 46, val, bc);

      Y2 += 17;
    });

    drawFooter(doc);
  }

  // ════════════════════════════════════════
  //  SAVE
  // ════════════════════════════════════════
  const safeName = (name || 'Candidate').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  doc.save(`MATTA_Report_${safeName}.pdf`);
}
