/**
 * Dashboard.jsx
 * Main landing page — overview stats, progress bars, charts, and revisions.
 */

import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  RiBookOpenLine, RiTaskLine, RiCheckboxCircleLine, RiTimeLine
} from 'react-icons/ri';
import Card from '../components/ui/Card';
import RevisionList from '../components/RevisionList';
import { useStudy } from '../context/StudyContext';
import { useProgress } from '../hooks/useProgress';
import { formatDate } from '../utils/helpers';

const weeklyData = [
  { day: 'Mon', completed: 2, added: 3 },
  { day: 'Tue', completed: 4, added: 2 },
  { day: 'Wed', completed: 3, added: 5 },
  { day: 'Thu', completed: 6, added: 3 },
  { day: 'Fri', completed: 5, added: 4 },
  { day: 'Sat', completed: 7, added: 2 },
  { day: 'Sun', completed: 4, added: 1 },
];

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const { subjects, tasks, topics } = useStudy();
  const { progressBySubject, overallPercentage, completedTasks, pendingTasks } = useProgress();

  const stats = [
    { label: 'Subjects',        value: subjects.length,  icon: RiBookOpenLine,        color: 'text-primary-400',  bg: 'bg-primary-500/15' },
    { label: 'Total Tasks',     value: tasks.length,     icon: RiTaskLine,             color: 'text-amber-400',    bg: 'bg-amber-500/15'   },
    { label: 'Completed',       value: completedTasks,   icon: RiCheckboxCircleLine,   color: 'text-accent-400',   bg: 'bg-accent-500/15'  },
    { label: 'Pending',         value: pendingTasks,     icon: RiTimeLine,             color: 'text-rose-400',     bg: 'bg-rose-500/15'    },
  ];

  // Logic for the Revision Ratio Pie Chart
  const pendingRevisions = topics.filter(t => t.nextRevisionDate && new Date(t.nextRevisionDate) <= new Date()).length;
  const upcomingRevisions = topics.filter(t => t.nextRevisionDate && new Date(t.nextRevisionDate) > new Date()).length;
  const completedTopics = topics.filter(t => t.status === 'Completed').length;

  const pieData = [
    { name: 'Completed', value: completedTopics || 1 }, // Fallback to 1 if empty for pie visibility during demo
    { name: 'Pending Revisions', value: pendingRevisions },
    { name: 'Upcoming Revisions', value: upcomingRevisions }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-surface-400 text-sm mt-1">
          {formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} variants={itemVariants}>
            <Card animate={false} className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bg}`}>
                <Icon className={`text-xl ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-surface-400 font-medium">{label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main content: Area Chart + Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart */}
        <Card animate={false} className="lg:col-span-2">
          <h3 className="text-base font-semibold text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradAdded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: 12 }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#6366f1" fill="url(#gradCompleted)" strokeWidth={2} />
              <Area type="monotone" dataKey="added"     name="Added"     stroke="#10b981" fill="url(#gradAdded)"     strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Subject Progress */}
        <Card animate={false}>
          <h3 className="text-base font-semibold text-white mb-4">Subject Progress</h3>
          <div className="space-y-4">
            {progressBySubject.map(({ subjectId, name, icon, color, percentage }) => (
              <div key={subjectId}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-surface-300 flex items-center gap-1.5">
                    <span>{icon}</span> {name}
                  </span>
                  <span className="text-xs font-bold" style={{ color }}>{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-700/70 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overall */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs font-semibold text-white">Overall</span>
              <span className="text-xs font-bold text-accent-400">{overallPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-surface-700/70 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Revisions List & Revision Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card animate={false} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Upcoming Revisions</h3>
            <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded">Action Required</span>
          </div>
          <RevisionList />
        </Card>
        
        <Card animate={false} className="flex flex-col">
          <h3 className="text-base font-semibold text-white mb-2">Revision Overview</h3>
          <p className="text-xs text-surface-400 mb-4">Ratio of completed topics vs pending revisions.</p>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
