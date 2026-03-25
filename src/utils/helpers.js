/**
 * helpers.js
 * Common utility functions used across the application.
 */

// ─── Date & Time ─────────────────────────────────────────────────────────────

/** Format an ISO date string to a human-readable date (e.g. "Mar 25, 2026") */
export function formatDate(isoString, options = {}) {
  if (!isoString) return '—';
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(new Date(isoString));
}

/** Return true if an ISO date string is in the past */
export function isPast(isoString) {
  if (!isoString) return false;
  return new Date(isoString) < new Date();
}

/** Days remaining until a due date (negative if overdue) */
export function daysUntil(isoString) {
  if (!isoString) return null;
  const diff = new Date(isoString).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.round(diff / 86_400_000);
}

// ─── String Helpers ───────────────────────────────────────────────────────────

/** Truncate a string to maxLength and append ellipsis */
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/** Extract initials from a name (up to 2 characters) */
export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Capitalise the first letter of a string */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Number Helpers ───────────────────────────────────────────────────────────

/**
 * Calculate a percentage.
 * @param {number} value
 * @param {number} total
 * @param {number} [decimals=1]
 * @returns {number}
 */
export function calcPercentage(value, total, decimals = 1) {
  if (!total) return 0;
  return Math.round((value / total) * Math.pow(10, decimals + 2)) / Math.pow(10, decimals);
}

/** Clamp a number between min and max */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// ─── Priority Helpers ─────────────────────────────────────────────────────────

const PRIORITY_META = {
  high:   { label: 'High',   color: 'text-red-400',    bg: 'bg-red-500/20',    badge: 'bg-red-500/20 text-red-400' },
  medium: { label: 'Medium', color: 'text-amber-400',  bg: 'bg-amber-500/20',  badge: 'bg-amber-500/20 text-amber-400' },
  low:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-400' },
};

export function getPriorityMeta(priority) {
  return PRIORITY_META[priority] ?? PRIORITY_META.medium;
}

// ─── Filtering & Sorting ──────────────────────────────────────────────────────

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/**
 * Filter an array of tasks based on search query and active filters.
 */
export function filterTasks(tasks = [], subjects = [], topics = [], query = '', filters = {}) {
  const queryLower = query.toLowerCase().trim();

  return tasks.filter(task => {
    // 1. Search (Match across Task Title, Topic Title, Topic Notes, Subject Name)
    if (queryLower) {
      const taskSubject = subjects.find(s => s.id === task.subjectId);
      const taskTopic = topics.find(t => t.id === task.topicId);
      
      const matchTitle = (task.title || '').toLowerCase().includes(queryLower);
      const matchSubject = (taskSubject?.name || '').toLowerCase().includes(queryLower);
      const matchTopicTitle = (taskTopic?.title || '').toLowerCase().includes(queryLower);
      const matchTopicNotes = (taskTopic?.notes || '').toLowerCase().includes(queryLower);

      if (!matchTitle && !matchSubject && !matchTopicTitle && !matchTopicNotes) {
        return false;
      }
    }

    // 2. Filters
    const { subject, priority, status, deadline } = filters;

    if (subject && subject !== 'all' && task.subjectId !== subject) return false;
    
    if (priority && priority !== 'all' && task.priority !== priority) return false;
    
    if (status && status !== 'all') {
      if (status === 'completed' && !task.completed) return false;
      if (status === 'pending' && task.completed) return false;
    }

    if (deadline && deadline !== 'all') {
      if (!task.dueDate) return false; // Task has no due date but deadline filter expects one
      
      // Calculate days until
      const diff = new Date(task.dueDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
      const days = Math.round(diff / 86_400_000);

      if (deadline === 'overdue' && days >= 0) return false;
      if (deadline === 'today' && days !== 0) return false;
      if (deadline === 'upcoming' && days <= 0) return false;
    }

    return true;
  });
}

/** 
 * Sort data items based on sortBy config.
 * sortBy: { field: 'dueDate' | 'priority' | 'subjectName', direction: 'asc' | 'desc' }
 */
export function sortData(items = [], sortBy = { field: 'dueDate', direction: 'asc' }, subjects = []) {
  const { field, direction } = sortBy;
  const modifier = direction === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    // Always push completed tasks to the bottom if it's task list (optional standard UX)
    // if (a.completed !== b.completed) return a.completed ? 1 : -1;

    let aValue, bValue;

    if (field === 'priority') {
      aValue = PRIORITY_ORDER[a.priority] ?? 1;
      bValue = PRIORITY_ORDER[b.priority] ?? 1;
      // For priority, Asc means High(0)->Low(2), Desc means Low(2)->High(0)
    } 
    else if (field === 'subjectName') {
      aValue = subjects.find(s => s.id === a.subjectId)?.name?.toLowerCase() || '';
      bValue = subjects.find(s => s.id === b.subjectId)?.name?.toLowerCase() || '';
    } 
    else {
      // Default: dueDate
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
    }

    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return 1 * modifier;
    return 0;
  });
}
