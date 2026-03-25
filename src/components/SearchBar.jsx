import { useState, useEffect } from 'react';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import { useStudy } from '../context/StudyContext';
import { useDebounce } from '../hooks/useDebounce';

export default function SearchBar() {
  const { actions, searchQuery } = useStudy();
  
  // Local state for instant UI typing, global state for debounced actual filtering
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const debouncedQuery = useDebounce(localQuery, 300);

  useEffect(() => {
    actions.setSearchQuery(debouncedQuery);
  }, [debouncedQuery, actions]);

  // Sync if global state is cleared externally
  useEffect(() => {
    if (searchQuery === '' && localQuery !== '') {
      setLocalQuery('');
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full max-w-md">
      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
      <input
        type="text"
        placeholder="Search tasks, topics, or notes..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="form-input w-full pl-10 pr-10 py-2 bg-surface-800/80 border border-surface-700 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-surface-500"
      />
      {localQuery && (
        <button
          onClick={() => setLocalQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
        >
          <RiCloseLine />
        </button>
      )}
    </div>
  );
}
