import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RiAddLine, RiDeleteBin6Line, RiCheckboxCircleLine, RiCheckboxBlankCircleLine, RiEdit2Line } from 'react-icons/ri';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SearchBar from '../components/SearchBar';
import FilterSortPanel from '../components/FilterSortPanel';
import { useTasks } from '../hooks/useTasks';
import { useStudy } from '../context/StudyContext';
import { formatDate, getPriorityMeta, filterTasks, sortData } from '../utils/helpers';

const schema = yup.object({
  title:     yup.string().required('Title is required').min(3),
  subjectId: yup.string().required('Select a subject'),
  topicId:   yup.string().default(''),
  priority:  yup.string().oneOf(['high', 'medium', 'low']).default('medium'),
  dueDate:   yup.string().default(''),
});

export default function Tasks() {
  const { subjects, topics, searchQuery, filters, sortBy } = useStudy();
  const { tasks, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [showForm, setShowForm]       = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '', subjectId: '', topicId: '', priority: 'medium', dueDate: '' },
  });

  const selectedSubject = watch('subjectId');
  const filteredTopics  = topics.filter(t => t.subjectId === selectedSubject);

  // Apply search + filters + sort
  const processedTasks = sortData(filterTasks(tasks, subjects, topics, searchQuery, filters), sortBy, subjects);

  const onSubmit = (data) => {
    if (editingTask) { updateTask({ id: editingTask.id, ...data }); setEditingTask(null); }
    else addTask(data);
    reset(); setShowForm(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    reset({ title: task.title, subjectId: task.subjectId, topicId: task.topicId || '', priority: task.priority, dueDate: task.dueDate || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <p className="text-surface-400 text-sm mt-0.5">{tasks.filter(t => !t.completed).length} pending overall</p>
        </div>
        <Button icon={RiAddLine} onClick={() => setShowForm(v => !v)}>Add Task</Button>
      </div>

      {/* Add / Edit Task form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card animate={false}>
              <h3 className="text-sm font-semibold text-white mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                  <input {...register('title')} placeholder="Task title *" className="form-input" />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select {...register('subjectId')} className="form-input">
                      <option value="">Select subject *</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                    {errors.subjectId && <p className="text-red-400 text-xs mt-1">{errors.subjectId.message}</p>}
                  </div>
                  <select {...register('topicId')} className="form-input">
                    <option value="">Select topic (optional)</option>
                    {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select {...register('priority')} className="form-input">
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                  <input {...register('dueDate')} type="date" className="form-input" />
                </div>
                <div className="flex gap-3">
                  <Button type="submit">{editingTask ? 'Update Task' : 'Save Task'}</Button>
                  <Button variant="ghost" onClick={() => { setShowForm(false); setEditingTask(null); reset(); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4">
        <SearchBar />
        <FilterSortPanel />
      </div>

      {/* Task list */}
      <div className="space-y-2 mt-4 pb-12">
        <AnimatePresence>
          {processedTasks.map(task => {
            const priority      = getPriorityMeta(task.priority);
            const parentSubject = subjects.find(s => s.id === task.subjectId);
            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>
                <Card animate={false} className={`flex items-center gap-4 py-3.5 px-4 ${task.completed ? 'opacity-60' : ''}`}>
                  {/* Complete toggle */}
                  <button onClick={() => toggleTask(task.id)} className="shrink-0 text-2xl transition-colors text-surface-500 hover:text-accent-400">
                    {task.completed ? <RiCheckboxCircleLine className="text-accent-400" /> : <RiCheckboxBlankCircleLine />}
                  </button>

                  {/* Title + subject badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-surface-500' : 'text-white'}`}>{task.title}</p>
                      {parentSubject && (
                        <span className="text-[10px] bg-surface-700/50 px-2 py-0.5 rounded text-surface-400 truncate hidden sm:inline-block border border-surface-600/30">
                          {parentSubject.name}
                        </span>
                      )}
                    </div>
                    {task.dueDate && <p className="text-xs text-surface-400 mt-0.5">Due {formatDate(task.dueDate)}</p>}
                  </div>

                  {/* Priority badge */}
                  <span className={`badge ${priority.badge} shrink-0 hidden sm:inline-flex`}>{task.priority}</span>

                  {/* Edit / Delete actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(task)} className="text-surface-600 hover:text-primary-400 transition-colors p-1" title="Edit Task"><RiEdit2Line /></button>
                    <button onClick={() => deleteTask(task.id)} className="text-surface-600 hover:text-red-400 transition-colors p-1" title="Delete Task"><RiDeleteBin6Line /></button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {processedTasks.length === 0 && (
          <div className="text-center bg-surface-800/50 py-10 rounded-xl border border-dashed border-surface-700 mt-6">
            <p className="text-surface-400 text-sm">No tasks match your filter and search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
