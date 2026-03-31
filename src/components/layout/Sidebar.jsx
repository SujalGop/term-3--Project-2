import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiDashboardLine, RiBookOpenLine, RiTaskLine, RiRefreshLine, RiRobot2Line, RiGraduationCapLine } from 'react-icons/ri';
import { useProgress } from '../../hooks/useProgress';

const NAV_ITEMS = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/subjects',  icon: RiBookOpenLine,  label: 'Subjects'  },
  { to: '/tasks',     icon: RiTaskLine,      label: 'Tasks'     },
  { to: '/revision',  icon: RiRefreshLine,   label: 'Revision'  },
  { to: '/ai-tools',  icon: RiRobot2Line,    label: 'AI Tools'  },
];

export default function Sidebar() {
  const { overallPercentage, completedTasks, totalTasks } = useProgress();

  return (
    <aside className="flex flex-col h-full w-64 glass border-r border-white/10 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600/50">
          <RiGraduationCapLine className="text-primary-300 text-xl" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">StudyAI</h1>
          <p className="text-[10px] text-surface-400 font-medium tracking-wide uppercase">Companion</p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/30 text-primary-300 border-l-2 border-primary-400 pl-[10px]'
                  : 'text-surface-400 hover:text-surface-100 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`text-lg shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                {label}
                {isActive && (
                  <motion.div layoutId="sidebar-active-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Overall progress summary */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="glass rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-surface-400 font-medium">Overall Progress</span>
            <span className="text-xs font-bold text-accent-400">{overallPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-surface-500 mt-1.5">{completedTasks} / {totalTasks} tasks completed</p>
        </div>
      </div>
    </aside>
  );
}
