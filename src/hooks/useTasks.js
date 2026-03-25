/**
 * useTasks.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Convenience hook that wraps StudyContext task actions and provides
 * commonly needed filter/sort helpers.
 *
 * Returns:
 *   tasks            – raw array from context
 *   addTask(payload) – create a new task
 *   updateTask(payload)
 *   deleteTask(id)
 *   toggleTask(id)   – flip completed flag
 *   getTasksBySubject(subjectId)
 *   getTasksByTopic(topicId)
 *   getPendingTasks()
 *   getCompletedTasks()
 *   getTasksByPriority(priority)  – 'high' | 'medium' | 'low'
 *   getOverdueTasks()
 */

import { useCallback } from 'react';
import { useStudy } from '../context/StudyContext';

export function useTasks() {
  const { tasks, actions } = useStudy();

  /** Tasks belonging to a specific subject */
  const getTasksBySubject = useCallback(
    (subjectId) => tasks.filter(t => t.subjectId === subjectId),
    [tasks]
  );

  /** Tasks belonging to a specific topic */
  const getTasksByTopic = useCallback(
    (topicId) => tasks.filter(t => t.topicId === topicId),
    [tasks]
  );

  /** All incomplete tasks */
  const getPendingTasks = useCallback(
    () => tasks.filter(t => !t.completed),
    [tasks]
  );

  /** All completed tasks */
  const getCompletedTasks = useCallback(
    () => tasks.filter(t => t.completed),
    [tasks]
  );

  /** Tasks filtered by priority level */
  const getTasksByPriority = useCallback(
    (priority) => tasks.filter(t => t.priority === priority),
    [tasks]
  );

  /** Tasks whose dueDate is before today and are not completed */
  const getOverdueTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    });
  }, [tasks]);

  return {
    tasks,
    addTask:    actions.addTask,
    updateTask: actions.updateTask,
    deleteTask: actions.deleteTask,
    toggleTask: actions.toggleTask,
    getTasksBySubject,
    getTasksByTopic,
    getPendingTasks,
    getCompletedTasks,
    getTasksByPriority,
    getOverdueTasks,
  };
}
