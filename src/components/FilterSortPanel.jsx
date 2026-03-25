import { RiFilter3Line, RiSortDesc, RiSortAsc } from 'react-icons/ri';
import { useStudy } from '../context/StudyContext';

export default function FilterSortPanel() {
  const { subjects, filters, sortBy, actions } = useStudy();

  const handleFilterChange = (field, value) => {
    actions.setFilters({ [field]: value });
  };

  const handleSortFieldChange = (field) => {
    actions.setSortBy({ ...sortBy, field });
  };

  const toggleSortDirection = () => {
    actions.setSortBy({ ...sortBy, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="w-full bg-surface-800/40 border border-surface-700/50 rounded-xl p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shadow-sm">
      
      {/* Filters Group */}
      <div className="flex flex-wrap items-center gap-3 flex-1 flex-col sm:flex-row w-full xl:w-auto">
        <div className="flex items-center gap-2 text-surface-400 font-medium text-sm pr-2">
          <RiFilter3Line /> <span className="hidden sm:inline">Filter</span>
        </div>
        
        <select 
          value={filters.subject} 
          onChange={(e) => handleFilterChange('subject', e.target.value)}
          className="form-input text-xs py-1.5 focus:ring-1 bg-surface-800 w-full sm:w-auto"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select 
          value={filters.priority} 
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="form-input text-xs py-1.5 focus:ring-1 bg-surface-800 w-full sm:w-auto"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="form-input text-xs py-1.5 focus:ring-1 bg-surface-800 w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <select 
          value={filters.deadline} 
          onChange={(e) => handleFilterChange('deadline', e.target.value)}
          className="form-input text-xs py-1.5 focus:ring-1 bg-surface-800 w-full sm:w-auto"
        >
          <option value="all">Any Deadline</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due Today</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      <div className="hidden xl:block w-px h-8 bg-surface-700/50"></div>

      {/* Sort Group */}
      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2 text-surface-400 font-medium text-sm pr-2">
           <span className="hidden sm:inline">Sort By</span>
        </div>
        <select
          value={sortBy.field}
          onChange={(e) => handleSortFieldChange(e.target.value)}
          className="form-input text-xs py-1.5 focus:ring-1 bg-surface-800 flex-1 sm:flex-none"
        >
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="subjectName">Subject Name</option>
        </select>
        
        <button
          onClick={toggleSortDirection}
          className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-300 transition-colors flex items-center justify-center shrink-0"
          title={`Sort ${sortBy.direction === 'asc' ? 'Descending' : 'Ascending'}`}
        >
          {sortBy.direction === 'asc' ? <RiSortAsc /> : <RiSortDesc />}
        </button>
      </div>
    </div>
  );
}
