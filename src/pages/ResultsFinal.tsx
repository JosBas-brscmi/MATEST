import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadFinalPdf } from '../lib/pdfFinalReport';

export default function ResultsFinal() {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    // ── Read from sessionStorage with correct keys (set by TestRunner.tsx) ──
    const readResult = (key: string) => {
      // Try sessionStorage first (current implementation)
      const s = sessionStorage.getItem(`lastResult:${key}`);
      if (s) return JSON.parse(s);
      // Fallback: try old localStorage keys (legacy)
      const l1 = localStorage.getItem(`matta_results_${key}`);
      if (l1) return JSON.parse(l1);
      // Fallback: try consolidated cache
      try {
        const all = localStorage.getItem('matta_all_results_v1');
        if (all) {
          const parsed = JSON.parse(all);
          if (parsed[key]) return parsed[key];
        }
      } catch { /* ignore */ }
      return null;
    };

    const iq      = readResult('iq');
    const english = readResult('english');
    const aptitude = readResult('aptitude');

    // Track which are missing
    const missingList: string[] = [];
    if (!iq)       missingList.push('Intelligence Test');
    if (!english)  missingList.push('English Assessment');
    if (!aptitude) missingList.push('Aptitude & Personality');
    setMissing(missingList);

    if (iq || english || aptitude) {
      setData({ iq, english, aptitude });
    }
  }, []);

  const startDownload = async () => {
    if (!data || (!data.iq && !data.english && !data.aptitude)) {
      alert('Error: No assessment data found. Please complete the tests first.');
      return;
    }
    try {
      await downloadFinalPdf(data);
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('An error occurred generating the PDF. Please try again.');
    }
  };

  const allComplete = missing.length === 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4">
      <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl text-center max-w-md w-full">

        {/* Status */}
        <div className={`text-3xl font-black mb-2 ${allComplete ? 'text-green-400' : 'text-yellow-400'}`}>
          {allComplete ? 'COMPLETED' : 'PARTIAL RESULTS'}
        </div>

        {allComplete ? (
          <p className="text-slate-400 text-sm mb-8">
            All three assessments completed. Your final report is ready.
          </p>
        ) : (
          <div className="mb-8">
            <p className="text-slate-400 text-sm mb-3">
              {data ? 'Some assessments are missing:' : 'No assessment data found.'}
            </p>
            {missing.length > 0 && (
              <ul className="text-left text-sm space-y-1">
                {['Intelligence Test', 'English Assessment', 'Aptitude & Personality'].map((name) => {
                  const done = !missing.includes(name);
                  return (
                    <li key={name} className={`flex items-center gap-2 ${done ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{done ? '✓' : '✗'}</span>
                      <span>{name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-3">
          {/* Show download button if at least some data exists */}
          {data && (
            <button
              onClick={startDownload}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold shadow-lg transition-all hover:scale-105"
            >
              {allComplete ? 'Download Final Report (PDF)' : 'Download Partial Report (PDF)'}
            </button>
          )}

          {/* If no data at all, show go back button */}
          {!data && (
            <button
              onClick={() => nav('/portal')}
              className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold shadow-lg transition-all"
            >
              Go Back and Complete Tests
            </button>
          )}

          <button
            onClick={() => nav('/portal')}
            className="w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-xl font-medium transition-all"
          >
            Return to Portal
          </button>
        </div>
      </div>
    </div>
  );
}

