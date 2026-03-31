import { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';

export function useProgress() {
  const { subjects, tasks } = useStudy();

  // Per-subject completion stats
  const progressBySubject = useMemo(() =>
    subjects.map(subject => {
      const subjectTasks   = tasks.filter(t => t.subjectId === subject.id);
      const completedTasks = subjectTasks.filter(t => t.completed).length;
      const totalTasks     = subjectTasks.length;
      const percentage     = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;
      return { subjectId: subject.id, name: subject.name, color: subject.color, icon: subject.icon, totalTasks, completedTasks, pendingTasks: totalTasks - completedTasks, percentage };
    }),
  [subjects, tasks]);

  // Aggregate across all subjects
  const { totalTasks, completedTasks } = useMemo(() => ({
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
  }), [tasks]);

  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

  return {
    progressBySubject,
    overallPercentage,
    totalTasks,
    completedTasks,
    pendingTasks: totalTasks - completedTasks,
  };
}
