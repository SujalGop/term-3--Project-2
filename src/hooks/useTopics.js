import { useCallback, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';

/**
 * useTopics hook
 * Provides filtered topics and convenient methods for Topic Management
 * 
 * @param {string|null} subjectId Optional subject ID to filter topics
 */
export function useTopics(subjectId = null) {
  const { topics, actions } = useStudy();

  const filteredTopics = useMemo(() => {
    if (!subjectId) return topics;
    return topics.filter(t => t.subjectId === subjectId);
  }, [topics, subjectId]);

  const addTopic = useCallback((topicData) => {
    // Expected topicData: { subjectId, title, difficulty, status, notes }
    actions.addTopic(topicData);
  }, [actions]);

  const editTopic = useCallback((id, updatedData) => {
    actions.updateTopic({ id, ...updatedData });
  }, [actions]);

  const deleteTopic = useCallback((id) => {
    actions.deleteTopic(id);
  }, [actions]);

  const updateTopicStatus = useCallback((id, status) => {
    const topic = topics.find(t => t.id === id);
    if (topic) {
      actions.updateTopic({ ...topic, status });
    }
  }, [topics, actions]);

  return {
    topics: filteredTopics,
    addTopic,
    editTopic,
    deleteTopic,
    updateTopicStatus,
  };
}
