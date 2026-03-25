/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root application component.
 *
 * Routing tree:
 *   /             → redirect → /dashboard
 *   /dashboard    → Dashboard
 *   /subjects     → Subjects
 *   /tasks        → Tasks
 *   /revision     → Revision
 *   /ai-tools     → AITools
 *
 * All routes share a common Layout (Sidebar + main area).
 * The entire tree is wrapped in StudyProvider.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StudyProvider } from './context/StudyContext';
import Layout    from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Subjects  from './pages/Subjects';
import Tasks     from './pages/Tasks';
import Revision  from './pages/Revision';
import AITools   from './pages/AITools';

export default function App() {
  return (
    <StudyProvider>
      <BrowserRouter>
        <ToastContainer position="bottom-right" theme="dark" />
        <Routes>
          {/* Default redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Shared layout wrapper */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects"  element={<Subjects />}  />
            <Route path="/tasks"     element={<Tasks />}     />
            <Route path="/revision"  element={<Revision />}  />
            <Route path="/ai-tools"  element={<AITools />}   />
          </Route>

          {/* Catch-all: redirect unknown paths back to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </StudyProvider>
  );
}
