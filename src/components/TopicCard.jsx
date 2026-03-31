import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowDownSLine, RiArrowUpSLine, RiDeleteBin6Line, RiEdit2Line, RiCheckLine, RiCloseLine, RiAddLine } from 'react-icons/ri';
import Card from './ui/Card';

const DIFFICULTY_COLORS = {
  Easy:   'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard:   'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_COLORS = {
  'Not Started':    'text-surface-400 bg-surface-700/50',
  'In Progress':    'text-blue-400 bg-blue-400/10',
  'Completed':      'text-emerald-400 bg-emerald-400/10',
  'Needs Revision': 'text-orange-400 bg-orange-400/10',
};

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'Needs Revision'];

export default function TopicCard({ topic, onDelete, onStatusChange, onUpdate }) {
  const [showNotes, setShowNotes]         = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [editForm, setEditForm]           = useState(topic);
  const [addingNote, setAddingNote]       = useState(false);
  const [newNote, setNewNote]             = useState({ title: '', content: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteData, setEditNoteData]   = useState({ title: '', content: '' });

  // Support legacy string notes by converting to the notes array format
  const notesArray = Array.isArray(topic.notes)
    ? topic.notes
    : (typeof topic.notes === 'string' && topic.notes.trim()
      ? [{ id: 'gen-1', title: 'General Notes', content: topic.notes }]
      : []);

  const handleSaveTopic = () => {
    if (onUpdate) onUpdate({ ...editForm, notes: topic.notes });
    setIsEditing(false);
  };

  const saveNewNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    if (onUpdate) onUpdate({ ...topic, notes: [...notesArray, { id: Date.now().toString(), ...newNote }] });
    setNewNote({ title: '', content: '' });
    setAddingNote(false);
  };

  const deleteNote  = (noteId) => { if (onUpdate) onUpdate({ ...topic, notes: notesArray.filter(n => n.id !== noteId) }); };
  const saveEditNote = () => {
    if (onUpdate) onUpdate({ ...topic, notes: notesArray.map(n => n.id === editingNoteId ? { ...n, ...editNoteData } : n) });
    setEditingNoteId(null);
  };

  if (isEditing) {
    return (
      <Card animate={false} className="p-4 overflow-hidden border border-surface-700/50 shadow-sm relative">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center bg-surface-800 p-2 rounded border border-surface-700">
            <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="bg-transparent border-none text-sm font-semibold text-white w-full outline-none" placeholder="Topic Title" />
            <div className="flex gap-2">
              <button onClick={handleSaveTopic} className="text-emerald-400 hover:text-emerald-300 p-1" title="Save"><RiCheckLine size={18} /></button>
              <button onClick={() => setIsEditing(false)} className="text-surface-400 hover:text-surface-300 p-1" title="Cancel"><RiCloseLine size={18} /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-1">
            <div>
              <label className="text-surface-400 mb-1 block">Difficulty</label>
              <select value={editForm.difficulty} onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })} className="form-input p-1.5 text-xs h-auto cursor-pointer">
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className="text-surface-400 mb-1 block">Status</label>
              <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="form-input p-1.5 text-xs h-auto cursor-pointer">
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-surface-400 mb-1 block">Revision Schedule</label>
              <input type="date" value={editForm.nextRevisionDate ? editForm.nextRevisionDate.split('T')[0] : ''} onChange={e => setEditForm({ ...editForm, nextRevisionDate: e.target.value })} className="form-input p-1.5 text-xs h-auto" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card animate={false} className="p-4 overflow-hidden border border-surface-700/50 shadow-sm relative group">
      <div className="flex flex-col gap-3">
        {/* Header: title + action buttons */}
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-semibold text-white">{topic.title}</h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => { setEditForm(topic); setIsEditing(true); }} className="text-surface-500 hover:text-primary-400 transition-colors p-1" title="Edit Topic">
              <RiEdit2Line size={16} />
            </button>
            <button onClick={() => onDelete(topic.id)} className="text-surface-500 hover:text-red-400 transition-colors p-1" title="Delete Topic">
              <RiDeleteBin6Line size={16} />
            </button>
          </div>
        </div>

        {/* Difficulty badge + Status dropdown */}
        <div className="flex items-center gap-3 text-xs">
          {topic.difficulty && (
            <span className={`px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[topic.difficulty] || 'text-surface-400'}`}>{topic.difficulty}</span>
          )}
          <select
            value={topic.status}
            onChange={e => onStatusChange(topic.id, e.target.value)}
            className={`px-2 py-0.5 rounded text-xs appearance-none cursor-pointer outline-none ${STATUS_COLORS[topic.status] || 'text-surface-400 bg-surface-700/50'}`}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status} className="bg-surface-800 text-white">{status}</option>
            ))}
          </select>
        </div>

        {/* Notes section */}
        <div className="mt-2 border-t border-surface-700/50 pt-2">
          <button onClick={() => setShowNotes(v => !v)} className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-200 transition-colors">
            <span>{showNotes ? 'Hide Notes' : `Show Notes & Resources (${notesArray.length})`}</span>
            {showNotes ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
          </button>

          <AnimatePresence>
            {showNotes && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 space-y-3">
                {notesArray.length === 0 && !addingNote && (
                  <p className="text-xs text-surface-400 text-center py-2">No notes added yet.</p>
                )}

                {notesArray.map(note => (
                  <div key={note.id} className="bg-surface-800/50 rounded border border-surface-700/30 overflow-hidden">
                    {editingNoteId === note.id ? (
                      <div className="p-2 space-y-2">
                        <input value={editNoteData.title} onChange={e => setEditNoteData({ ...editNoteData, title: e.target.value })} className="form-input p-1 text-xs" placeholder="Note Title" />
                        <textarea value={editNoteData.content} onChange={e => setEditNoteData({ ...editNoteData, content: e.target.value })} className="form-input p-1.5 text-xs resizer-none" rows={3} placeholder="Content..." />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditingNoteId(null)} className="text-[10px] text-surface-400 px-2 py-0.5 rounded hover:bg-surface-700">Cancel</button>
                          <button onClick={saveEditNote} className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded hover:bg-primary-500/30">Save Note</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800 border-b border-surface-700/30">
                          <h5 className="text-xs font-semibold text-white">{note.title}</h5>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingNoteId(note.id); setEditNoteData({ title: note.title, content: note.content }); }} className="text-surface-500 hover:text-primary-400 p-0.5" title="Edit Note"><RiEdit2Line size={12} /></button>
                            <button onClick={() => deleteNote(note.id)} className="text-surface-500 hover:text-red-400 p-0.5" title="Delete Note"><RiDeleteBin6Line size={12} /></button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-surface-300 font-sans whitespace-pre-wrap">{note.content}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {addingNote ? (
                  <div className="bg-surface-800/80 rounded border border-primary-500/20 p-2 space-y-2 mt-2">
                    <input value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} className="form-input p-1 text-xs" placeholder="New Note Title" />
                    <textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} className="form-input p-1.5 text-xs resizer-none" rows={3} placeholder="Paste notes here..." />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setAddingNote(false)} className="text-[10px] text-surface-400 px-2 py-0.5 rounded hover:bg-surface-700">Cancel</button>
                      <button onClick={saveNewNote} className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded hover:bg-primary-500/30">Add to Topic</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingNote(true)} className="flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300 transition-colors mt-2">
                    <RiAddLine /> Add Note block
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
