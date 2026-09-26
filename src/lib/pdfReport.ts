// src/lib/pdfReport.ts
import jsPDF from 'jspdf';
import type { TestKey } from '../lib';

type Score = { correct: number; total: number; percent: number };

export type PdfReportInput = {
  testKey: TestKey;
  specTitle: string;
  durationMinutes: number;
  candidateEmail: string;
  submittedAtISO: string;
  score: Score;
  payload?: any;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatLocalDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

async function fetchAsBase64(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to fetch: ${url} (${r.status})`);
  const buf = await r.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function trySetFont(doc: jsPDF, family: string, style: 'normal' | 'bold') {
  try {
    doc.setFont(family, style);
    return true;
  } catch {
    return false;
  }
}

/**
 * Defensive font setup:
 * - If NotoSansTC is available, use it (for Chinese)
 * - Otherwise fallback to built-in helvetica (English only, but won't crash)
 */
async function ensureFonts(doc: jsPDF) {
  // Try load Chinese fonts from /public/fonts/
  // You should place:
  //  - public/fonts/NotoSansTC-Regular.ttf
  //  - public/fonts/NotoSansTC-Bold.ttf
  try {
    const [regB64, boldB64] = await Promise.all([
      fetchAsBase64('/fonts/NotoSansTC-Regular.ttf'),
      fetchAsBase64('/fonts/NotoSansTC-Bold.ttf'),
    ]);

    doc.addFileToVFS('NotoSansTC-Regular.ttf', regB64);
    doc.addFont('NotoSansTC-Regular.ttf', 'NotoSansTC', 'normal');

    doc.addFileToVFS('NotoSansTC-Bold.ttf', boldB64);
    doc.addFont('NotoSansTC-Bold.ttf', 'NotoSansTC', 'bold');

    // Set default to Chinese font
    doc.setFont('NotoSansTC', 'normal');
    return { family: 'NotoSansTC' as const };
  } catch {
    // fallback
    doc.setFont('helvetica', 'normal');
    return { family: 'helvetica' as const };
  }
}

function hr(doc: jsPDF, x1: number, x2: number, y: number) {
  doc.setDrawColor(160);
  doc.setLineWidth(0.2);
  doc.line(x1, y, x2, y);
  doc.setDrawColor(0);
}

function box(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(200);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2);
  doc.setDrawColor(0);
}

function drawLabelValue(
  doc: jsPDF,
  fontFamily: string,
  x: number,
  y: number,
  label: string,
  value: string
) {
  // label bold if possible
  if (!trySetFont(doc, fontFamily, 'bold')) doc.setFont('helvetica', 'bold');
  doc.text(label, x, y);

  if (!trySetFont(doc, fontFamily, 'normal')) doc.setFont('helvetica', 'normal');
  doc.text(value, x + 42, y);
}

function tableRow(
  doc: jsPDF,
  fontFamily: string,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number[],
  cells: string[],
  header = false
) {
  doc.setDrawColor(210);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);

  let cx = x;
  for (let i = 0; i < cols.length; i++) {
    const cw = cols[i];
    if (i > 0) doc.line(cx, y, cx, y + h);

    const tx = cx + 2;
    const ty = y + h / 2 + 2.2;

    if (header) {
      if (!trySetFont(doc, fontFamily, 'bold')) doc.setFont('helvetica', 'bold');
    } else {
      if (!trySetFont(doc, fontFamily, 'normal')) doc.setFont('helvetica', 'normal');
    }

    doc.text(cells[i] ?? '', tx, ty, { maxWidth: cw - 4 });

    cx += cw;
  }
  doc.setDrawColor(0);
}

export async function buildPdfReport(input: PdfReportInput): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { family } = await ensureFonts(doc);

  // --- Layout ---
  const pageW = 210;
  const left = 14;
  const right = pageW - 14;

  // --- Header (Logo + Title) ---
  // Your repo shows: public/matta-logo.png
  try {
    const logoB64 = await fetchAsBase64('/matta-logo.png');
    doc.addImage(`data:image/png;base64,${logoB64}`, 'PNG', left, 12, 20, 20);
  } catch {
    // no logo -> continue
  }

  // Titles
  if (!trySetFont(doc, family, 'bold')) doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BROWAVE MATTA CENTER', left + 24, 19);

  if (!trySetFont(doc, family, 'normal')) doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Assessment Result Report（測驗結果報告）', left + 24, 25);

  hr(doc, left, right, 32);

  // --- Candidate block ---
  if (!trySetFont(doc, family, 'bold')) doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Candidate Information（受測者資訊）', left, 40);

  box(doc, left, 44, right - left, 32);

  doc.setFontSize(10);
  drawLabelValue(doc, family, left + 4, 52, 'Candidate（Email）', input.candidateEmail || 'unknown');
  drawLabelValue(doc, family, left + 4, 58, 'Assessment（測驗）', input.specTitle);
  drawLabelValue(doc, family, left + 4, 64, 'Submitted（提交）', formatLocalDateTime(input.submittedAtISO));
  drawLabelValue(doc, family, left + 4, 70, 'Duration（時長）', `${input.durationMinutes} min`);

  // --- Score Summary ---
  if (!trySetFont(doc, family, 'bold')) doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Score Summary（分數摘要）', left, 86);

  box(doc, left, 90, right - left, 38);

  const tx = left + 4;
  const ty = 96;
  const tw = right - left - 8;
  const cols = [tw * 0.45, tw * 0.18, tw * 0.18, tw * 0.19];

  tableRow(doc, family, tx, ty, tw, 10, cols, ['Metric（項目）', 'Correct（答對）', 'Total（題數）', 'Percent（%）'], true);
  tableRow(
    doc,
    family,
    tx,
    ty + 10,
    tw,
    10,
    cols,
    ['Scored Items（計分題）', String(input.score.correct), String(input.score.total), `${input.score.percent}%`],
    false
  );

  if (!trySetFont(doc, family, 'normal')) doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    'Note（註）：This report is for recruitment screening and internal review only.（本報告僅供招募篩選與內部審查使用。）',
    left,
    134
  );
  doc.setTextColor(0);

  // --- Sign-off ---
  if (!trySetFont(doc, family, 'bold')) doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Sign-off（簽核）', left, 148);

  box(doc, left, 152, right - left, 45);

  if (!trySetFont(doc, family, 'normal')) doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const sigY1 = 168;
  const sigY2 = 186;

  doc.text('MA Center Reviewer（審核人）:', left + 4, sigY1);
  doc.line(left + 58, sigY1 + 1, left + 140, sigY1 + 1);
  doc.text('Date（日期）:', left + 145, sigY1);
  doc.line(left + 165, sigY1 + 1, right - 4, sigY1 + 1);

  doc.text('HR / Dept. Approver（核准）:', left + 4, sigY2);
  doc.line(left + 58, sigY2 + 1, left + 140, sigY2 + 1);
  doc.text('Date（日期）:', left + 145, sigY2);
  doc.line(left + 165, sigY2 + 1, right - 4, sigY2 + 1);

  // --- Footer ---
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `Generated by MATTA Center System | Test: ${input.testKey} | ${formatLocalDateTime(new Date().toISOString())}`,
    left,
    287
  );
  doc.setTextColor(0);

  return doc;
}

export async function downloadPdfReport(input: PdfReportInput) {
  const doc = await buildPdfReport(input);
  const safeKey = String(input.testKey).toUpperCase();
  const emailSafe = String(input.candidateEmail || 'unknown').replaceAll('@', '_').replaceAll('.', '_');
  doc.save(`BROWAVE_MATTA_${safeKey}_Result_${emailSafe}.pdf`);
}







