import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RiAddLine, RiBookOpenLine } from 'react-icons/ri';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useStudy } from '../context/StudyContext';
import { useProgress } from '../hooks/useProgress';
import { useTopics } from '../hooks/useTopics';
import SubjectCard from '../components/SubjectCard';
import TopicCard from '../components/TopicCard';

const subjectSchema = yup.object({
  name:  yup.string().required('Subject name is required').min(2, 'Too short'),
  icon:  yup.string().default('📚'),
  color: yup.string().default('#6366f1'),
});

const topicSchema = yup.object({
  title:            yup.string().required('Topic title is required').min(2, 'Too short'),
  difficulty:       yup.string().oneOf(['Easy', 'Medium', 'Hard']).required(),
  status:           yup.string().oneOf(['Not Started', 'In Progress', 'Completed', 'Needs Revision']).required(),
  nextRevisionDate: yup.string(),
  notes:            yup.mixed().optional(),
});

const PRESET_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316'];

const slideAnim = { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.25 } };

export default function Subjects() {
  const { subjects, actions } = useStudy();
  const { progressBySubject } = useProgress();
  const { topics, addTopic, deleteTopic, updateTopicStatus } = useTopics();

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [showTopicForm, setShowTopicForm]     = useState(false);

  const { register: registerSubject, handleSubmit: handleSubmitSubject, reset: resetSubject, watch: watchSubject, setValue: setValueSubject, formState: { errors: subjectErrors } } = useForm({
    resolver: yupResolver(subjectSchema),
    defaultValues: { name: '', icon: '📚', color: '#6366f1' },
  });
  const selectedColor = watchSubject('color');

  const { register: registerTopic, handleSubmit: handleSubmitTopic, reset: resetTopic, formState: { errors: topicErrors } } = useForm({
    resolver: yupResolver(topicSchema),
    defaultValues: { title: '', difficulty: 'Medium', status: 'Not Started', nextRevisionDate: '', notes: [] },
  });

  const onSubjectSubmit = (data) => { actions.addSubject(data); resetSubject(); setShowSubjectForm(false); };
  const onTopicSubmit   = (data) => { addTopic({ subjectId: activeSubjectId, ...data }); resetTopic(); setShowTopicForm(false); };

  const progressMap         = Object.fromEntries(progressBySubject.map(p => [p.subjectId, p]));
  const activeSubjectTopics = topics.filter(t => t.subjectId === activeSubjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Subjects</h2>
          <p className="text-surface-400 text-sm mt-0.5">{subjects.length} subjects tracked</p>
        </div>
        <Button icon={RiAddLine} onClick={() => setShowSubjectForm(v => !v)}>Add Subject</Button>
      </div>

      {/* Add Subject form */}
      <AnimatePresence>
        {showSubjectForm && (
          <motion.div {...slideAnim}>
            <Card animate={false} className="overflow-hidden">
              <h3 className="text-sm font-semibold text-white mb-4">New Subject</h3>
              <form onSubmit={handleSubmitSubject(onSubjectSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-surface-400 font-medium block mb-1.5">Name *</label>
                    <input {...registerSubject('name')} placeholder="e.g. Mathematics" className="form-input" />
                    {subjectErrors.name && <p className="text-red-400 text-xs mt-1">{subjectErrors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-surface-400 font-medium block mb-1.5">Emoji Icon</label>
                    <input {...registerSubject('icon')} placeholder="📚" className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-surface-400 font-medium block mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setValueSubject('color', c)} className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit">Save</Button>
                  <Button variant="ghost" onClick={() => setShowSubjectForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subjects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {subjects.map((subject) => {
            const subjectTopics     = topics.filter(t => t.subjectId === subject.id);
            const completedCount    = subjectTopics.filter(t => t.status === 'Completed').length;
            return (
              <SubjectCard
                key={subject.id}
                subject={subject}
                progress={progressMap[subject.id]}
                active={activeSubjectId === subject.id}
                onClick={() => { setActiveSubjectId(subject.id === activeSubjectId ? null : subject.id); setShowTopicForm(false); }}
                onDelete={actions.deleteSubject}
                topicsCount={subjectTopics.length}
                completedTopicsCount={completedCount}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Topics panel for active subject */}
      <AnimatePresence>
        {activeSubjectId && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-4 border-t border-surface-700/50 mt-8">
            <div className="flex items-center justify-between mb-6 mt-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <RiBookOpenLine className="text-primary-400" />
                Topics for {subjects.find(s => s.id === activeSubjectId)?.name}
              </h3>
              <Button icon={RiAddLine} onClick={() => setShowTopicForm(v => !v)}>Add Topic</Button>
            </div>

            {/* Add Topic form */}
            <AnimatePresence>
              {showTopicForm && (
                <motion.div {...slideAnim} className="mb-6">
                  <Card animate={false} className="border border-surface-700/50">
                    <h3 className="text-sm font-semibold text-white mb-4">New Topic</h3>
                    <form onSubmit={handleSubmitTopic(onTopicSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="col-span-1 lg:col-span-2">
                          <label className="text-xs text-surface-400 font-medium block mb-1.5">Topic Title *</label>
                          <input {...registerTopic('title')} placeholder="e.g. Binary Trees" className="form-input" />
                          {topicErrors.title && <p className="text-red-400 text-xs mt-1">{topicErrors.title.message}</p>}
                        </div>
                        <div>
                          <label className="text-xs text-surface-400 font-medium block mb-1.5">Difficulty</label>
                          <select {...registerTopic('difficulty')} className="form-input cursor-pointer">
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-surface-400 font-medium block mb-1.5">Status</label>
                          <select {...registerTopic('status')} className="form-input cursor-pointer">
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Needs Revision">Needs Revision</option>
                          </select>
                        </div>
                        <div className="col-span-1 lg:col-span-2">
                          <label className="text-xs text-surface-400 font-medium block mb-1.5">Schedule Revision Date</label>
                          <input type="date" {...registerTopic('nextRevisionDate')} className="form-input" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button type="submit">Save Topic</Button>
                        <Button variant="ghost" onClick={() => setShowTopicForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Topics grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
              <AnimatePresence>
                {activeSubjectTopics.map(topic => (
                  <motion.div key={topic.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <TopicCard topic={topic} onDelete={deleteTopic} onStatusChange={updateTopicStatus} onUpdate={actions.updateTopic} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {activeSubjectTopics.length === 0 && !showTopicForm && (
              <div className="text-center bg-surface-800/50 py-10 rounded-xl border border-dashed border-surface-700">
                <p className="text-surface-400 text-sm">No topics found for this subject.</p>
                <Button variant="ghost" className="mt-4" onClick={() => setShowTopicForm(true)}>Add your first topic</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
