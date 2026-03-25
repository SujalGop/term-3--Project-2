import { motion } from 'framer-motion';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Card from './ui/Card';

/**
 * SubjectCard represents a tracking subject and its aggregated statistics (tasks and topics).
 */
export default function SubjectCard({ subject, progress, active, onClick, onDelete, topicsCount, completedTopicsCount }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <Card 
        animate={false} 
        hover 
        className={`h-full cursor-pointer transition-all border-2 ${active ? 'border-primary-500/50 bg-surface-800/80' : 'border-transparent'}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{subject.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-white">{subject.name}</h3>
              <p className="text-xs text-surface-400">
                {progress?.totalTasks ?? 0} tasks • {completedTopicsCount}/{topicsCount} topics done
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subject.id);
            }}
            className="text-surface-600 hover:text-red-400 transition-colors p-1"
          >
            <RiDeleteBin6Line />
          </button>
        </div>

        {/* Tasks Progress bar */}
        {progress && (
          <>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-surface-400">{progress.completedTasks}/{progress.totalTasks} tasks done</span>
              <span className="font-bold" style={{ color: subject.color }}>{progress.percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-700/70 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: subject.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}
