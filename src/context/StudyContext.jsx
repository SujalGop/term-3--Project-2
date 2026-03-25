/**
 * StudyContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global state for the AI-Powered Study Companion.
 *
 * State shape:
 *   subjects  – array of Subject objects
 *   topics    – array of Topic objects (linked to a subject via subjectId)
 *   tasks     – array of Task objects  (linked to a topic   via topicId)
 *   loading   – boolean
 *   error     – string | null
 *
 * Entities:
 *   Subject : { id, name, color, icon, createdAt }
 *   Topic   : { id, subjectId, title, description, createdAt }
 *   Task    : { id, topicId, subjectId, title, completed, priority, dueDate, createdAt }
 */

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { addDays } from 'date-fns';
// ─── Helpers ────────────────────────────────────────────────────────────────

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const now = () => new Date().toISOString();

// ─── Seed Data ──────────────────────────────────────────────────────────────

const seed = (() => {
  const subjects = [
    { id: 'sub-1', name: 'Mathematics',       color: '#6366f1', icon: '📐', createdAt: now() },
    { id: 'sub-2', name: 'Computer Science',  color: '#10b981', icon: '💻', createdAt: now() },
    { id: 'sub-3', name: 'Physics',           color: '#f59e0b', icon: '⚛️',  createdAt: now() },
  ];

  const topics = [
    { id: 'top-1', subjectId: 'sub-1', title: 'Linear Algebra', difficulty: 'Hard', status: 'Completed', notes: 'Mastered vector spaces and eigenvalues.', createdAt: now() },
    { id: 'top-2', subjectId: 'sub-2', title: 'Data Structures', difficulty: 'Medium', status: 'In Progress', notes: 'Need to review AVL trees and graphs.', createdAt: now() },
    { id: 'top-3', subjectId: 'sub-2', title: 'Algorithms', difficulty: 'Hard', status: 'Needs Revision', notes: 'Dynamic programming concepts are tricky. Revisit knapsack problem.', createdAt: now() },
    { id: 'top-4', subjectId: 'sub-3', title: 'Classical Mechanics', difficulty: 'Medium', status: 'Not Started', notes: '', createdAt: now() },
  ];

  const tasks = [
    { id: 'tsk-1', topicId: 'top-1', subjectId: 'sub-1', title: 'Complete Chapter 3 exercises',   completed: true,  priority: 'high',   dueDate: '2026-03-25', createdAt: now() },
    { id: 'tsk-2', topicId: 'top-1', subjectId: 'sub-1', title: 'Watch MIT OCW lecture 5',        completed: false, priority: 'medium', dueDate: '2026-03-27', createdAt: now() },
    { id: 'tsk-3', topicId: 'top-2', subjectId: 'sub-2', title: 'Implement a Binary Search Tree', completed: true,  priority: 'high',   dueDate: '2026-03-24', createdAt: now() },
    { id: 'tsk-4', topicId: 'top-2', subjectId: 'sub-2', title: 'Solve 5 LeetCode medium problems', completed: false, priority: 'high', dueDate: '2026-03-28', createdAt: now() },
    { id: 'tsk-5', topicId: 'top-3', subjectId: 'sub-2', title: 'Analyze QuickSort complexity',   completed: false, priority: 'low',    dueDate: '2026-03-30', createdAt: now() },
    { id: 'tsk-6', topicId: 'top-4', subjectId: 'sub-3', title: 'Derive equations of motion',     completed: true,  priority: 'medium', dueDate: '2026-03-23', createdAt: now() },
    { id: 'tsk-7', topicId: 'top-4', subjectId: 'sub-3', title: 'Read Chapter 2 of Halliday',     completed: false, priority: 'low',    dueDate: '2026-03-29', createdAt: now() },
  ];

  return { subjects, topics, tasks };
})();

// ─── Initial State ───────────────────────────────────────────────────────────

const STUB_STATE = {
  ...seed,
  searchQuery: '',
  filters: { subject: 'all', priority: 'all', status: 'all', deadline: 'all' },
  sortBy: { field: 'dueDate', direction: 'asc' },
  revisionSettings: { intervalDays: 3 },
  loading: false,
  error: null,
};

const STORAGE_KEY = 'ai_study_companion_data';

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge persisted data with default ephemeral state
      return {
        ...STUB_STATE,
        subjects: parsed.subjects || STUB_STATE.subjects,
        topics: parsed.topics || STUB_STATE.topics,
        tasks: parsed.tasks || STUB_STATE.tasks,
        revisionSettings: parsed.revisionSettings || STUB_STATE.revisionSettings,
      };
    }
  } catch (err) {
    console.error('[StudyContext] Failed to parse local storage', err);
  }
  return STUB_STATE;
};

// ─── Action Types ────────────────────────────────────────────────────────────

export const ACTIONS = {
  // Subjects
  ADD_SUBJECT:    'ADD_SUBJECT',
  UPDATE_SUBJECT: 'UPDATE_SUBJECT',
  DELETE_SUBJECT: 'DELETE_SUBJECT',

  // Topics
  ADD_TOPIC:    'ADD_TOPIC',
  UPDATE_TOPIC: 'UPDATE_TOPIC',
  DELETE_TOPIC: 'DELETE_TOPIC',

  // Tasks
  ADD_TASK:    'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  TOGGLE_TASK: 'TOGGLE_TASK',

  // Meta
  SET_LOADING: 'SET_LOADING',
  SET_ERROR:   'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Search & Filter
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS:      'SET_FILTERS',
  SET_SORT_BY:      'SET_SORT_BY',
  
  // Revision
  SET_REVISION_SETTINGS: 'SET_REVISION_SETTINGS',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function studyReducer(state, action) {
  switch (action.type) {

    // ── Subjects ──────────────────────────────────────────────────────────
    case ACTIONS.ADD_SUBJECT:
      return {
        ...state,
        subjects: [...state.subjects, { ...action.payload, id: genId(), createdAt: now() }],
      };

    case ACTIONS.UPDATE_SUBJECT:
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };

    case ACTIONS.DELETE_SUBJECT: {
      const deletedTopicIds = state.topics
        .filter(t => t.subjectId === action.payload)
        .map(t => t.id);
      return {
        ...state,
        subjects: state.subjects.filter(s => s.id !== action.payload),
        topics:   state.topics.filter(t => t.subjectId !== action.payload),
        tasks:    state.tasks.filter(t => !deletedTopicIds.includes(t.topicId)),
      };
    }

    // ── Topics ────────────────────────────────────────────────────────────
    case ACTIONS.ADD_TOPIC:
      return {
        ...state,
        topics: [...state.topics, { ...action.payload, id: genId(), createdAt: now() }],
      };

    case ACTIONS.UPDATE_TOPIC: {
      const isCompleting = action.payload.status === 'Completed';
      const updatedTopics = state.topics.map(t => {
        if (t.id === action.payload.id) {
          const wasCompleted = t.status === 'Completed';
          const updated = { ...t, ...action.payload };
          
          if (isCompleting && !wasCompleted) {
            updated.completedAt = now();
          }
          return updated;
        }
        return t;
      });
      return { ...state, topics: updatedTopics };
    }

    case ACTIONS.DELETE_TOPIC:
      return {
        ...state,
        topics: state.topics.filter(t => t.id !== action.payload),
        tasks:  state.tasks.filter(t => t.topicId !== action.payload),
      };

    // ── Tasks ─────────────────────────────────────────────────────────────
    case ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, {
          ...action.payload,
          id: genId(),
          completed: false,
          createdAt: now(),
        }],
      };

    case ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };

    case ACTIONS.TOGGLE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      };

    // ── Search & Filters ──────────────────────────────────────────────────
    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case ACTIONS.SET_SORT_BY:
      return { ...state, sortBy: action.payload };

    case ACTIONS.SET_REVISION_SETTINGS:
      return { ...state, revisionSettings: { ...state.revisionSettings, ...action.payload } };

    // ── Meta ──────────────────────────────────────────────────────────────
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      console.warn(`[StudyContext] Unknown action type: "${action.type}"`);
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const StudyContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function StudyProvider({ children }) {
  const [state, dispatch] = useReducer(studyReducer, STUB_STATE, getInitialState);

  // Persist state changes back to local storage
  useEffect(() => {
    try {
      const dataToSave = {
        subjects: state.subjects,
        topics: state.topics,
        tasks: state.tasks,
        revisionSettings: state.revisionSettings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.error('[StudyContext] Failed to save to local storage', err);
    }
  }, [state.subjects, state.topics, state.tasks, state.revisionSettings]);

  // ── Convenience action creators (stable references) ──────────────────

  const addSubject    = useCallback(payload => dispatch({ type: ACTIONS.ADD_SUBJECT,    payload }), []);
  const updateSubject = useCallback(payload => dispatch({ type: ACTIONS.UPDATE_SUBJECT, payload }), []);
  const deleteSubject = useCallback(id      => dispatch({ type: ACTIONS.DELETE_SUBJECT, payload: id }), []);

  const addTopic      = useCallback(payload => dispatch({ type: ACTIONS.ADD_TOPIC,    payload }), []);
  const updateTopic   = useCallback(payload => dispatch({ type: ACTIONS.UPDATE_TOPIC, payload }), []);
  const deleteTopic   = useCallback(id      => dispatch({ type: ACTIONS.DELETE_TOPIC, payload: id }), []);

  const addTask       = useCallback(payload => dispatch({ type: ACTIONS.ADD_TASK,    payload }), []);
  const updateTask    = useCallback(payload => dispatch({ type: ACTIONS.UPDATE_TASK, payload }), []);
  const deleteTask    = useCallback(id      => dispatch({ type: ACTIONS.DELETE_TASK, payload: id }), []);
  const toggleTask    = useCallback(id      => dispatch({ type: ACTIONS.TOGGLE_TASK, payload: id }), []);

  const setSearchQuery = useCallback(payload => dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload }), []);
  const setFilters     = useCallback(payload => dispatch({ type: ACTIONS.SET_FILTERS, payload }), []);
  const setSortBy      = useCallback(payload => dispatch({ type: ACTIONS.SET_SORT_BY, payload }), []);
  
  const updateRevisionSettings = useCallback(payload => dispatch({ type: ACTIONS.SET_REVISION_SETTINGS, payload }), []);

  const value = {
    // State slices
    subjects: state.subjects,
    topics:   state.topics,
    tasks:    state.tasks,
    searchQuery: state.searchQuery,
    filters:  state.filters,
    sortBy:   state.sortBy,
    revisionSettings: state.revisionSettings,
    loading:  state.loading,
    error:    state.error,

    // Raw dispatch (for advanced use)
    dispatch,

    // Action creators
    actions: {
      addSubject, updateSubject, deleteSubject,
      addTopic,   updateTopic,   deleteTopic,
      addTask,    updateTask,    deleteTask,    toggleTask,
      setSearchQuery, setFilters, setSortBy, updateRevisionSettings,
    },
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}

// ─── Convenience Hook ────────────────────────────────────────────────────────

/**
 * useStudy()
 * Must be called inside a <StudyProvider> tree.
 */
export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error('useStudy must be used within a <StudyProvider>');
  }
  return ctx;
}
