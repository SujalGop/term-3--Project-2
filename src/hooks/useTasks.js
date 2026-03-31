import { useCallback } from 'react';
import { useStudy } from '../context/StudyContext';

export function useTasks() {
  const { tasks, actions } = useStudy();

  const getTasksBySubject  = useCallback((subjectId) => tasks.filter(t => t.subjectId === subjectId), [tasks]);
  const getTasksByTopic    = useCallback((topicId)   => tasks.filter(t => t.topicId === topicId), [tasks]);
  const getPendingTasks    = useCallback(()          => tasks.filter(t => !t.completed), [tasks]);
  const getCompletedTasks  = useCallback(()          => tasks.filter(t =>  t.completed), [tasks]);
  const getTasksByPriority = useCallback((priority)  => tasks.filter(t => t.priority === priority), [tasks]);

  const getOverdueTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today);
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
