import { useCallback, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';

// Provides topics list and CRUD actions, optionally filtered by subjectId
export function useTopics(subjectId = null) {
  const { topics, actions } = useStudy();

  const filteredTopics = useMemo(() =>
    subjectId ? topics.filter(t => t.subjectId === subjectId) : topics,
  [topics, subjectId]);

  const addTopic = useCallback((topicData) => actions.addTopic(topicData), [actions]);

  const editTopic = useCallback((id, updatedData) => actions.updateTopic({ id, ...updatedData }), [actions]);

  const deleteTopic = useCallback((id) => actions.deleteTopic(id), [actions]);

  const updateTopicStatus = useCallback((id, status) => {
    const topic = topics.find(t => t.id === id);
    if (topic) actions.updateTopic({ ...topic, status });
  }, [topics, actions]);

  return { topics: filteredTopics, addTopic, editTopic, deleteTopic, updateTopicStatus };
}
