import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RiMenuLine } from 'react-icons/ri';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden relative bg-surface-950">

      {/* Mobile top header bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-surface-900/80 backdrop-blur-md border-b border-surface-700/50 flex items-center px-4 z-40">
        <button onClick={() => setIsMobileOpen(true)} className="text-surface-200 hover:text-white p-2 -ml-2 rounded-lg transition-colors">
          <RiMenuLine size={24} />
        </button>
        <div className="ml-2">
          <h1 className="text-[15px] font-bold text-white leading-tight">StudyAI</h1>
          <p className="text-[9px] text-primary-400 font-medium tracking-wide uppercase">Companion</p>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-none`}>
        <div className="h-full bg-surface-900 md:bg-transparent">
          <Sidebar />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto mt-14 md:mt-0 relative z-0">
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
