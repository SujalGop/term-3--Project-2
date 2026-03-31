import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiNotification4Line, RiCalendarEventLine } from 'react-icons/ri';
import { useStudy } from '../context/StudyContext';
import { formatDate } from '../utils/helpers';
import Card from './ui/Card';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function RevisionList() {
  const { topics, subjects } = useStudy();

  const scheduledTopics = topics
    .filter(t => t.nextRevisionDate)
    .sort((a, b) => new Date(a.nextRevisionDate) - new Date(b.nextRevisionDate))
    .slice(0, 5);

  if (scheduledTopics.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-surface-400 text-sm">No revisions scheduled yet.</p>
        <p className="text-surface-500 text-xs mt-1">Complete a topic to automatically assign a revision date.</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <AnimatePresence>
        {scheduledTopics.map(topic => {
          const subject   = subjects.find(s => s.id === topic.subjectId);
          const today     = new Date().setHours(0, 0, 0, 0);
          const revDate   = new Date(topic.nextRevisionDate).setHours(0, 0, 0, 0);
          const isOverdue = revDate < today;
          const isToday   = revDate === today;
          const dateColor = isOverdue ? 'text-red-400 font-semibold' : isToday ? 'text-amber-400 font-semibold' : 'text-surface-400';

          return (
            <motion.div key={topic.id} variants={cardVariants} exit={{ opacity: 0 }}>
              <Link to="/subjects" className="block group">
                <Card animate={false} hover className="flex items-start gap-4 p-4 border border-surface-700/50 hover:border-primary-500/50 transition-colors">
                  <div className={`p-2 rounded-lg shrink-0 ${isOverdue ? 'bg-red-500/20 text-red-500' : isToday ? 'bg-amber-500/20 text-amber-500' : 'bg-primary-500/20 text-primary-400'}`}>
                    {isOverdue || isToday ? <RiNotification4Line size={20} /> : <RiCalendarEventLine size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors truncate">{topic.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {subject && (
                        <span className="text-[10px] bg-surface-700/50 px-2 py-0.5 rounded text-surface-400 truncate border border-surface-600/30">
                          {subject.name}
                        </span>
                      )}
                      <span className={`text-xs ${dateColor}`}>
                        {isOverdue ? 'Overdue' : isToday ? 'Due Today' : formatDate(topic.nextRevisionDate)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
