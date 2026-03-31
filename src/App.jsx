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
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects"  element={<Subjects />}  />
            <Route path="/tasks"     element={<Tasks />}     />
            <Route path="/revision"  element={<Revision />}  />
            <Route path="/ai-tools"  element={<AITools />}   />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </StudyProvider>
  );
}
