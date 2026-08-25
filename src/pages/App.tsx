// src/pages/App.tsx
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Landing from './Landing';
import Portal from './Portal';
import TestRunner from './TestRunner';
import Results from './Results';
import ResultsFinal from './ResultsFinal';
import Admin from './Admin';

export default function App() {
  return (
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
  );
}
