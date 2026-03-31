import { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from '../components/ui/Card';
import RevisionSettingsForm from '../components/RevisionSettingsForm';
import { formatDate } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const toMidnight = (date) => new Date(date).setHours(0, 0, 0, 0);

export default function Revision() {
  const { topics, subjects, tasks } = useStudy();
  const [selectedDate, setSelectedDate] = useState(null);

  // Dots on calendar tiles for topics (blue) and pending tasks (amber)
  const handleTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const d = date.setHours(0, 0, 0, 0);
    const dayTopics = topics.filter(t => t.nextRevisionDate && toMidnight(t.nextRevisionDate) === d);
    const dayTasks  = tasks.filter(t => t.dueDate && !t.completed && toMidnight(t.dueDate) === d);
    const total = dayTopics.length + dayTasks.length;
    if (!total) return null;
    return (
      <div className="mt-1 flex justify-center gap-1 flex-wrap max-w-full">
        {dayTopics.slice(0, 2).map((_, i) => <div key={`top-${i}`} className="w-1.5 h-1.5 rounded-full bg-primary-500" />)}
        {dayTasks.slice(0,  2).map((_, i) => <div key={`tsk-${i}`} className="w-1.5 h-1.5 rounded-full bg-amber-500" />)}
        {total > 4 && <div className="w-1.5 h-1.5 rounded-full bg-surface-400" />}
      </div>
    );
  };

  const topicDates = topics.filter(t => t.nextRevisionDate).map(t => toMidnight(t.nextRevisionDate));
  const taskDates  = tasks.filter(t => t.dueDate && !t.completed).map(t => toMidnight(t.dueDate));

  const handleTileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const d = date.setHours(0, 0, 0, 0);
    if (topicDates.includes(d) && taskDates.includes(d)) return 'highlighted-date-both';
    if (topicDates.includes(d)) return 'highlighted-date';
    if (taskDates.includes(d))  return 'highlighted-date-task';
    return null;
  };

  // Items to show: if a date is selected show only that day, otherwise show nearest 4
  const displayTopics = selectedDate
    ? topics.filter(t => t.nextRevisionDate && toMidnight(t.nextRevisionDate) === toMidnight(selectedDate))
    : topics.filter(t => t.nextRevisionDate).sort((a, b) => new Date(a.nextRevisionDate) - new Date(b.nextRevisionDate)).slice(0, 4);

  const displayTasks = selectedDate
    ? tasks.filter(t => t.dueDate && !t.completed && toMidnight(t.dueDate) === toMidnight(selectedDate))
    : tasks.filter(t => t.dueDate && !t.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Revision & Schedule Planner</h2>
          <p className="text-surface-400 text-sm mt-0.5">Manage and view your spaced repetition and upcoming tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card animate={false} className="p-2 sm:p-6 overflow-hidden">
            <style>{`
              .react-calendar { width: 100% !important; background: transparent !important; border: none !important; font-family: inherit !important; color: #f8fafc !important; }
              .react-calendar__navigation button { color: #f8fafc !important; font-size: 1.125rem !important; border-radius: 0.5rem !important; }
              .react-calendar__navigation button:enabled:hover,
              .react-calendar__navigation button:enabled:focus { background-color: rgba(255,255,255,0.1) !important; }
              .react-calendar__month-view__weekdays__weekday { color: #94a3b8 !important; font-weight: 600 !important; text-decoration: none !important; }
              .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none !important; }
              .react-calendar__tile { color: #f8fafc !important; padding: 1rem 0.5rem !important; border-radius: 0.5rem !important; transition: background-color 0.2s !important; }
              .react-calendar__tile:enabled:hover,
              .react-calendar__tile:enabled:focus { background-color: rgba(99,102,241,0.2) !important; color: #818cf8 !important; }
              .react-calendar__tile--now   { background-color: rgba(255,255,255,0.05) !important; color: #f8fafc !important; }
              .react-calendar__tile--active { background-color: #6366f1 !important; color: white !important; }
              .highlighted-date      { background-color: rgba(99,102,241,0.1) !important; border: 1px solid rgba(99,102,241,0.3) !important; }
              .highlighted-date-task { background-color: rgba(245,158,11,0.1) !important; border: 1px solid rgba(245,158,11,0.3) !important; }
              .highlighted-date-both { background-color: rgba(236,72,153,0.1) !important; border: 1px solid rgba(236,72,153,0.3) !important; }
              .react-calendar__month-view__days__day--neighboringMonth { color: #475569 !important; }
            `}</style>
            <Calendar tileContent={handleTileContent} tileClassName={handleTileClassName} onChange={setSelectedDate} value={selectedDate} className="w-full text-white pb-4" />
          </Card>
        </div>

        <div className="space-y-6">
          {/* Revision scheduler form */}
          <Card animate={false}>
            <h3 className="text-base font-semibold text-white mb-2">Schedule a Revision</h3>
            <p className="text-xs text-surface-400 mb-4">Explicitly set a revision schedule for any existing topic.</p>
            <RevisionSettingsForm />
          </Card>

          {/* Upcoming / selected day schedule list */}
          <Card animate={false}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">{selectedDate ? 'Schedule for' : 'Upcoming Schedule'}</h3>
                {selectedDate && <p className="text-xs text-primary-400 mt-0.5">{formatDate(selectedDate)}</p>}
              </div>
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="text-[10px] text-surface-400 hover:text-white px-2 py-1 bg-surface-700/50 rounded">Clear</button>
              )}
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {displayTopics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">Revisions</h4>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {displayTopics.map(topic => {
                        const s = subjects.find(sub => sub.id === topic.subjectId);
                        return (
                          <motion.div key={topic.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="p-3 bg-surface-800/50 border border-primary-500/20 rounded-lg">
                              <p className="text-sm font-medium text-white line-clamp-1">{topic.title}</p>
                              <div className="flex justify-between items-center mt-2">
                                {s && <span className="text-[10px] bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded">{s.name}</span>}
                                {!selectedDate && <span className="text-xs text-surface-400">{formatDate(topic.nextRevisionDate)}</span>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {displayTasks.length > 0 && (
                <div className={displayTopics.length > 0 ? 'pt-2 border-t border-surface-700/50' : ''}>
                  <h4 className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">Tasks Due</h4>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {displayTasks.map(tsk => {
                        const s = subjects.find(sub => sub.id === tsk.subjectId);
                        return (
                          <motion.div key={tsk.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="p-3 bg-surface-800/50 border border-amber-500/20 rounded-lg">
                              <p className="text-sm font-medium text-white line-clamp-1">{tsk.title}</p>
                              <div className="flex justify-between items-center mt-2">
                                {s && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">{s.name}</span>}
                                {!selectedDate && <span className="text-xs text-surface-400">{formatDate(tsk.dueDate)}</span>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {displayTopics.length === 0 && displayTasks.length === 0 && (
                <p className="text-surface-400 text-sm pt-2">No schedules found for this view.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
