import { format, isPast as dfIsPast, differenceInCalendarDays } from 'date-fns';

// Format an ISO date string to a human-readable date (e.g. "Mar 25, 2026")
// Passes optional Intl options (e.g. { weekday: 'long' }) for richer formatting
export function formatDate(isoString, options = {}) {
  if (!isoString) return '—';
  if (Object.keys(options).length > 0) {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', ...options }).format(new Date(isoString));
  }
  return format(new Date(isoString), 'MMM d, yyyy');
}

// Returns true if the given ISO date string is in the past
export function isPast(isoString) {
  if (!isoString) return false;
  return dfIsPast(new Date(isoString));
}

// Days remaining until due date (negative = overdue)
export function daysUntil(isoString) {
  if (!isoString) return null;
  return differenceInCalendarDays(new Date(isoString), new Date());
}

// Truncate a string and append ellipsis if it exceeds maxLength
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

// Extract up to 2 initials from a name string
export function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

// Capitalize the first letter of a string
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Calculate a percentage rounded to 1 decimal place
export function calcPercentage(value, total, decimals = 1) {
  if (!total) return 0;
  return Math.round((value / total) * Math.pow(10, decimals + 2)) / Math.pow(10, decimals);
}

// Clamp a number between min and max
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

const PRIORITY_META = {
  high:   { label: 'High',   color: 'text-red-400',    bg: 'bg-red-500/20',    badge: 'bg-red-500/20 text-red-400' },
  medium: { label: 'Medium', color: 'text-amber-400',  bg: 'bg-amber-500/20',  badge: 'bg-amber-500/20 text-amber-400' },
  low:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-400' },
};

export function getPriorityMeta(priority) {
  return PRIORITY_META[priority] ?? PRIORITY_META.medium;
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// Filter tasks by search query and active filters
export function filterTasks(tasks = [], subjects = [], topics = [], query = '', filters = {}) {
  const q = query.toLowerCase().trim();

  return tasks.filter(task => {
    // Search across task title, subject name, and linked topic title/notes
    if (q) {
      const subject = subjects.find(s => s.id === task.subjectId);
      const topic   = topics.find(t => t.id === task.topicId);
      const match =
        (task.title || '').toLowerCase().includes(q) ||
        (subject?.name || '').toLowerCase().includes(q) ||
        (topic?.title || '').toLowerCase().includes(q) ||
        (topic?.notes || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    const { subject, priority, status, deadline } = filters;

    if (subject  && subject  !== 'all' && task.subjectId !== subject)  return false;
    if (priority && priority !== 'all' && task.priority  !== priority) return false;

    if (status && status !== 'all') {
      if (status === 'completed' && !task.completed) return false;
      if (status === 'pending'   &&  task.completed) return false;
    }

    if (deadline && deadline !== 'all') {
      if (!task.dueDate) return false;
      const days = differenceInCalendarDays(new Date(task.dueDate), new Date());
      if (deadline === 'overdue'  && days >= 0) return false;
      if (deadline === 'today'    && days !== 0) return false;
      if (deadline === 'upcoming' && days <= 0)  return false;
    }

    return true;
  });
}

// Sort items by dueDate, priority, or subjectName
export function sortData(items = [], sortBy = { field: 'dueDate', direction: 'asc' }, subjects = []) {
  const { field, direction } = sortBy;
  const modifier = direction === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    let aVal, bVal;

    if (field === 'priority') {
      aVal = PRIORITY_ORDER[a.priority] ?? 1;
      bVal = PRIORITY_ORDER[b.priority] ?? 1;
    } else if (field === 'subjectName') {
      aVal = subjects.find(s => s.id === a.subjectId)?.name?.toLowerCase() || '';
      bVal = subjects.find(s => s.id === b.subjectId)?.name?.toLowerCase() || '';
    } else {
      // dueDate (default): tasks without a date are sorted last
      aVal = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
      bVal = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
    }

    if (aVal < bVal) return -1 * modifier;
    if (aVal > bVal) return  1 * modifier;
    return 0;
  });
}
