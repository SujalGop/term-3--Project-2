/**
 * useProgress.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Derives completion statistics from StudyContext state.
 *
 * Returns:
 *   progressBySubject  – array of per-subject progress objects
 *   overallPercentage  – number 0–100 across ALL subjects
 *   totalTasks         – total task count
 *   completedTasks     – completed task count
 *   pendingTasks       – pending task count
 */

import { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';

/**
 * @typedef {Object} SubjectProgress
 * @property {string} subjectId
 * @property {string} name
 * @property {string} color
 * @property {string} icon
 * @property {number} totalTasks
 * @property {number} completedTasks
 * @property {number} pendingTasks
 * @property {number} percentage  – 0-100, rounded to 1 decimal
 */

export function useProgress() {
  const { subjects, tasks } = useStudy();

  /**
   * Per-subject progress array.
   * Recalculates only when subjects or tasks change.
   */
  const progressBySubject = useMemo(() => {
    return subjects.map(subject => {
      const subjectTasks   = tasks.filter(t => t.subjectId === subject.id);
      const completedTasks = subjectTasks.filter(t => t.completed).length;
      const totalTasks     = subjectTasks.length;
      const percentage     = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 1000) / 10  // 1 decimal place
        : 0;

      return {
        subjectId:      subject.id,
        name:           subject.name,
        color:          subject.color,
        icon:           subject.icon,
        totalTasks,
        completedTasks,
        pendingTasks:   totalTasks - completedTasks,
        percentage,
      };
    });
  }, [subjects, tasks]);

  /**
   * Aggregate stats across all subjects.
   */
  const { totalTasks, completedTasks } = useMemo(() => {
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    return { totalTasks: total, completedTasks: completed };
  }, [tasks]);

  const overallPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 1000) / 10
    : 0;

  const pendingTasks = totalTasks - completedTasks;

  return {
    progressBySubject,
    overallPercentage,
    totalTasks,
    completedTasks,
    pendingTasks,
  };
}
