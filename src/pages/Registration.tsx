import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CandidateInfo } from '../types';

export default function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CandidateInfo>({
    fullName: '',
    school: '',
    course: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<CandidateInfo>>({});
  const [agreed, setAgreed] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<CandidateInfo> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.school.trim()) newErrors.school = 'School / University is required';
    if (!form.course.trim()) newErrors.course = 'Course / Degree is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Valid email address is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !agreed) return;
    // Store candidate info in sessionStorage
    sessionStorage.setItem('candidateInfo', JSON.stringify(form));
    navigate('/test');
  };

  const Field = ({
    label, name, placeholder, type = 'text',
  }: { label: string; name: keyof CandidateInfo; placeholder: string; type?: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-300 uppercase tracking-wider text-xs">
        {label} <span className="text-green-500">*</span>
      </label>
      <input
        type={type}
        inputMode={name === 'phone' ? 'numeric' : undefined}
        value={form[name]}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({
          ...f,
          [name]: name === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value,
        }))}
        className={`bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
          errors[name] ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
        }`}
      />
      {errors[name] && (
        <span className="text-red-400 text-xs">{errors[name]}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="w-px h-5 bg-gray-700" />
        <span className="text-gray-300 text-sm tracking-widest uppercase font-medium">
          Candidate Registration
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Title */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-green-400 text-xs font-medium uppercase tracking-wider mb-4">
              🧠 Intelligence Assessment · Phase 1
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Candidate Information</h1>
            <p className="text-gray-500 text-sm">
              Please provide accurate information. This data will be sent to MA CENTER upon test completion.
            </p>
          </div>

          {/* Test Details Banner */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex items-center gap-6 text-sm">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-white">25</span>
              <span className="text-gray-500 text-xs uppercase tracking-wider">Questions</span>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-green-400">30</span>
              <span className="text-gray-500 text-xs uppercase tracking-wider">Minutes</span>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <div className="flex flex-col items-center gap-0.5 flex-1 text-left">
              <span className="text-white font-medium text-xs">Pattern · Sequence · Matrix</span>
              <span className="text-gray-500 text-xs">Auto-submit when time ends</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
            <Field label="Full Name" name="fullName" placeholder="e.g. Maria Santos" />
            <Field label="School / University" name="school" placeholder="e.g. University of Santo Tomas" />
            <Field label="Course / Degree" name="course" placeholder="e.g. BS Business Administration" />
            <Field label="Email Address" name="email" placeholder="e.g. maria@email.com" type="email" />
            <Field label="Phone Number" name="phone" placeholder="e.g. 639171234567" type="tel" />

            {/* Agreement */}
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                agreed ? 'border-green-600 bg-green-900/20' : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setAgreed(!agreed)}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  agreed ? 'bg-green-500 border-green-500' : 'border-gray-600'
                }`}
              >
                {agreed && <span className="text-black text-xs font-bold">✓</span>}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                I confirm that all information provided is accurate. I consent to MA CENTER / MATTA
                storing and reviewing my assessment results for recruitment purposes.
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!agreed}
            className={`mt-6 w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wide transition-all ${
              agreed
                ? 'bg-green-500 hover:bg-green-400 text-black hover:scale-105 shadow-xl shadow-green-900/40'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            Proceed to Intelligence Test →
          </button>

          <p className="mt-4 text-center text-gray-600 text-xs">
            Once started, the 30-minute timer cannot be paused.
          </p>
        </div>
      </main>
    </div>
  );
}
