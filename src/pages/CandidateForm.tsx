import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CandidateForm() {
  const { testKey = 'iq' } = useParams<{ testKey: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    school:   '',
    course:   '',
    email:    '',
    phone:    '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const testLabels: Record<string, string> = {
    iq:       'Intelligence Test',
    english:  'English Proficiency Test',
    aptitude: 'Aptitude & Personality Test',
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.school.trim())   e.school   = 'School is required';
    if (!form.course.trim())   e.course   = 'Course is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Valid email is required';
    if (!form.phone.trim())    e.phone    = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStart = () => {
    if (!validate() || !agreed) return;
    // Save to sessionStorage for TestRunner to read
    sessionStorage.setItem('candidateInfo', JSON.stringify(form));
    navigate(`/test/${testKey}`);
  };

  // Note: Field is intentionally NOT a sub-component to avoid focus loss on re-render

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/portal')} className="text-gray-500 hover:text-white text-sm transition-colors">
          ← Back to Portal
        </button>
        <div className="w-px h-5 bg-gray-700" />
        <span className="text-gray-300 text-sm tracking-widest uppercase font-medium">
          Candidate Information
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Title */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30
              rounded-full px-4 py-1.5 text-green-400 text-xs font-medium uppercase tracking-wider mb-4">
              {testLabels[testKey] ?? testKey}
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Before You Begin</h1>
            <p className="text-gray-500 text-sm">
              Please provide your information. This will be included in your assessment report sent to MA CENTER.
            </p>
          </div>

          {/* Test info banner */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex items-center gap-6 text-sm">
            {testKey === 'iq' && (
              <>
                <div className="text-center"><div className="text-2xl font-black text-white">25</div><div className="text-gray-500 text-xs uppercase tracking-wider">Questions</div></div>
                <div className="w-px h-10 bg-gray-800" />
                <div className="text-center"><div className="text-2xl font-black text-green-400">30</div><div className="text-gray-500 text-xs uppercase tracking-wider">Minutes</div></div>
                <div className="w-px h-10 bg-gray-800" />
                <div className="text-xs text-gray-500">Pattern · Sequence · Matrix<br/>Auto-submit when time ends</div>
              </>
            )}
            {testKey === 'english' && (
              <>
                <div className="text-center"><div className="text-2xl font-black text-white">25</div><div className="text-gray-500 text-xs uppercase tracking-wider">Questions</div></div>
                <div className="w-px h-10 bg-gray-800" />
                <div className="text-center"><div className="text-2xl font-black text-purple-400">25</div><div className="text-gray-500 text-xs uppercase tracking-wider">Minutes</div></div>
                <div className="w-px h-10 bg-gray-800" />
                <div className="text-xs text-gray-500">Grammar · Vocabulary<br/>Reading · Writing</div>
              </>
            )}
            {testKey === 'aptitude' && (
              <>
                <div className="text-center"><div className="text-2xl font-black text-white">30</div><div className="text-gray-500 text-xs uppercase tracking-wider">Questions</div></div>
                <div className="w-px h-10 bg-gray-800" />
                <div className="text-center"><div className="text-2xl font-black text-emerald-400">18</div><div className="text-gray-500 text-xs uppercase tracking-wider">Minutes</div></div>
                <div className="w-px h-10 bg-gray-800" />
                <div className="text-xs text-gray-500">Work Aptitude<br/>Personality Profile</div>
              </>
            )}
          </div>

          {/* Form — using inline inputs to prevent focus loss on re-render */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                Full Name <span className="text-green-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                placeholder="e.g. Maria Santos"
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className={`bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.fullName ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                }`}
              />
              {errors.fullName && <span className="text-red-400 text-xs">{errors.fullName}</span>}
            </div>

            {/* School */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                School / University <span className="text-green-500">*</span>
              </label>
              <input
                type="text"
                value={form.school}
                placeholder="e.g. University of Santo Tomas"
                onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
                className={`bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.school ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                }`}
              />
              {errors.school && <span className="text-red-400 text-xs">{errors.school}</span>}
            </div>

            {/* Course */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                Course / Degree <span className="text-green-500">*</span>
              </label>
              <input
                type="text"
                value={form.course}
                placeholder="e.g. BS Business Administration"
                onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                className={`bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.course ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                }`}
              />
              {errors.course && <span className="text-red-400 text-xs">{errors.course}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email Address <span className="text-green-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                placeholder="e.g. maria@email.com"
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={`bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                }`}
              />
              {errors.email && <span className="text-red-400 text-xs">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                Phone Number <span className="text-green-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                placeholder="e.g. +63 917 123 4567"
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={`bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
                }`}
              />
              {errors.phone && <span className="text-red-400 text-xs">{errors.phone}</span>}
            </div>

            {/* Agreement */}
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                agreed ? 'border-green-600 bg-green-900/20' : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setAgreed(!agreed)}
            >
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                agreed ? 'bg-green-500 border-green-500' : 'border-gray-600'
              }`}>
                {agreed && <span className="text-black text-xs font-black">✓</span>}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                I confirm that all information is accurate. I consent to MA CENTER / MATTA storing
                and reviewing my assessment results for recruitment purposes.
              </p>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!agreed}
            className={`mt-6 w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wide transition-all ${
              agreed
                ? 'bg-green-500 hover:bg-green-400 text-black hover:scale-105 shadow-xl shadow-green-900/40'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            Start {testLabels[testKey] ?? 'Test'} →
          </button>

          <p className="mt-4 text-center text-gray-600 text-xs">
            Once started, the timer cannot be paused.
          </p>
        </div>
      </main>
    </div>
  );
}

