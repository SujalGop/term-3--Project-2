/**
 * AITools.jsx
 * UI shells for AI-powered study tools — Summary, Flashcards, Quiz Generator.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiRobot2Line, RiFileTextLine, RiFlashlightLine, RiQuestionLine, RiSendPlane2Line } from 'react-icons/ri';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useStudy } from '../context/StudyContext';
import { generateSummary, generateFlashcards, generateQuiz } from '../services/aiService';

const TOOLS = [
  { id: 'summary',    label: 'Text Summariser',     icon: RiFileTextLine,    color: 'text-primary-400',  bg: 'bg-primary-500/15', desc: 'Paste your notes and get a concise, structured summary.' },
  { id: 'flashcards', label: 'Flashcard Generator', icon: RiFlashlightLine,  color: 'text-amber-400',    bg: 'bg-amber-500/15',   desc: 'Enter a topic and generate revision flashcards instantly.' },
  { id: 'quiz',       label: 'Quiz Generator',      icon: RiQuestionLine,    color: 'text-accent-400',   bg: 'bg-accent-500/15',  desc: 'Create a multiple-choice quiz on any topic to test yourself.' },
];

export default function AITools() {
  const { subjects, topics } = useStudy();
  const [activeTool, setActiveTool] = useState('summary');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
  const [userAnswers, setUserAnswers] = useState({});

  // Form state
  const [text, setText]             = useState('');
  const [topic, setTopic]           = useState('');
  const [subject, setSubject]       = useState('');
  const [count, setCount]           = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  const selectedSubjectObj = subjects.find(s => s.name === subject);
  const subjectTopics = selectedSubjectObj ? topics.filter(t => t.subjectId === selectedSubjectObj.id) : [];

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      let res;
      if (activeTool === 'summary') {
        res = await generateSummary(text, { subject });
        setResult({ type: 'markdown', content: res });
      } else if (activeTool === 'flashcards') {
        res = await generateFlashcards(topic, { count: Number(count), subject });
        setResult({ type: 'flashcards', content: res });
      } else {
        setUserAnswers({});
        res = await generateQuiz(topic, { count: Number(count), subject, difficulty });
        setResult({ type: 'quiz', content: res });
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const canRun = activeTool === 'summary' ? text.trim().length > 20 : topic.trim().length > 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RiRobot2Line className="text-primary-400 text-2xl" />
        <div>
          <h2 className="text-2xl font-bold text-white">AI Tools</h2>
          <p className="text-surface-400 text-sm mt-0.5">Powered by LLM</p>
        </div>
      </div>

      {/* Tool Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); setResult(null); setError(null); }}
            className={`text-left glass rounded-2xl p-4 transition-all duration-200 ${
              activeTool === tool.id ? 'border border-primary-500/50 bg-primary-600/10' : 'glass-hover'
            }`}
          >
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${tool.bg} mb-3`}>
              <tool.icon className={`text-xl ${tool.color}`} />
            </div>
            <p className="text-sm font-semibold text-white">{tool.label}</p>
            <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Input Panel */}
      <Card animate={false}>
        <div className="space-y-3">
          {/* Subject select */}
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="form-input"
          >
            <option value="">Subject (optional)</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
          </select>

          {activeTool === 'summary' ? (
            <textarea
              rows={6}
              placeholder="Paste your study notes or any text here…"
              value={text}
              onChange={e => setText(e.target.value)}
              className="form-input resize-none"
            />
          ) : (
            <div>
              <input
                placeholder={`Enter a topic (e.g. "Binary Search Trees")…`}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="form-input"
              />
              {subjectTopics.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-2 font-semibold">Or pick from existing topics:</p>
                  <div className="flex gap-2 flex-wrap">
                    {subjectTopics.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTopic(t.title)}
                        className="text-[11px] bg-primary-500/10 text-primary-300 px-3 py-1.5 rounded-md border border-primary-500/20 hover:bg-primary-500/20 hover:border-primary-500/40 transition-colors"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(activeTool === 'flashcards' || activeTool === 'quiz') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-surface-400 block mb-1">Count</label>
                <input type="number" min={3} max={20} value={count} onChange={e => setCount(e.target.value)} className="form-input" />
              </div>
              {activeTool === 'quiz' && (
                <div>
                  <label className="text-xs text-surface-400 block mb-1">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="form-input">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <Button icon={RiSendPlane2Line} onClick={handleRun} loading={loading} disabled={!canRun}>
            {loading ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="glass border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:10 }}>
            <Card animate={false}>
              {result.type === 'markdown' && (
                <pre className="text-sm text-surface-200 whitespace-pre-wrap leading-relaxed font-sans">{result.content}</pre>
              )}
              {result.type === 'flashcards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.content.map((card, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <p className="text-xs font-bold text-primary-400 mb-2">Q {i + 1}</p>
                      <p className="text-sm text-white font-medium mb-3">{card.front}</p>
                      <p className="text-sm text-accent-300 border-t border-white/10 pt-3">{card.back}</p>
                    </div>
                  ))}
                </div>
              )}
              {result.type === 'quiz' && (
                <div className="space-y-4">
                  {result.content.map((q, i) => {
                    const selected = userAnswers[i];
                    const isAnswered = selected !== undefined;
                    const correctAnswer = q.answer?.trim().toLowerCase();

                    return (
                      <div key={i} className="glass rounded-xl p-4">
                        <p className="text-sm text-white font-medium mb-3">{i+1}. {q.question}</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {q.options?.map((opt, j) => {
                            const optionText = opt.trim().toLowerCase();
                            const isCorrectOption = optionText === correctAnswer;
                            const isSelectedOption = optionText === selected?.trim().toLowerCase();
                            
                            let btnClass = 'bg-white/5 text-surface-300 hover:bg-white/10 cursor-pointer'; // Default state

                            if (isAnswered) {
                              if (isCorrectOption) {
                                btnClass = 'bg-accent-500/20 text-accent-300 border border-accent-500/40'; // Highlight correct
                              } else if (isSelectedOption) {
                                btnClass = 'bg-red-500/20 text-red-300 border border-red-500/40'; // Highlight wrong selection
                              } else {
                                btnClass = 'bg-white/5 text-surface-500 opacity-50 cursor-default'; // Fade out others
                              }
                            }

                            return (
                              <button 
                                key={j} 
                                onClick={() => !isAnswered && setUserAnswers(prev => ({ ...prev, [i]: opt }))}
                                disabled={isAnswered}
                                className={`text-xs text-left rounded-lg px-3 py-2 transition-all ${btnClass}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {isAnswered && q.explanation && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-surface-400 mt-3 pt-3 border-t border-white/10 italic">
                            <span className="text-white font-medium">Explanation: </span>{q.explanation}
                          </motion.p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
