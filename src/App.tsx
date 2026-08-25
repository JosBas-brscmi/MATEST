import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Registration from './pages/Registration';
import TestRunner from './pages/TestRunner';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/MATEST" element={<Landing />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/test" element={<TestRunner />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}
