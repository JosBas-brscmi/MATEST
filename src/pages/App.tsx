// src/pages/App.tsx
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Landing = lazy(() => import('./Landing'));
const Portal = lazy(() => import('./Portal'));
const TestRunner = lazy(() => import('./TestRunner'));
const Results = lazy(() => import('./Results'));
const ResultsFinal = lazy(() => import('./ResultsFinal'));
const Admin = lazy(() => import('./Admin'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 p-8 text-center text-white">Loading MATTA Center…</div>}>
      <Routes>
        {/* Landing page with candidate info form */}
        <Route path="/" element={<Landing />} />

      {/* Portal - assessment hub */}
      <Route path="/portal" element={<Portal />} />

      {/* Test - direct from portal (no /form needed anymore) */}
      <Route path="/test/:testKey" element={<TestRunner />} />

      {/* Results */}
      <Route path="/results/final" element={<ResultsFinal />} />
      <Route path="/results/:testKey" element={<Results />} />

      <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
