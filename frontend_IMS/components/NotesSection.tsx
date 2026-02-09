import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, X, Trash2, Palette, StickyNote, Edit2, Clock } from 'lucide-react';

interface NotesSectionProps {
  userId: string;
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const COLORS = [
  { id: 'white', bg: 'bg-white', border: 'border-gray-200' },
  { id: 'red', bg: 'bg-red-50', border: 'border-red-100' },
  { id: 'orange', bg: 'bg-orange-50', border: 'border-orange-100' },
  { id: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { id: 'green', bg: 'bg-green-50', border: 'border-green-100' },
  { id: 'teal', bg: 'bg-teal-50', border: 'border-teal-100' },
  { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { id: 'purple', bg: 'bg-purple-50', border: 'border-purple-100' },
  { id: 'pink', bg: 'bg-pink-50', border: 'border-pink-100' },
];

const NotesSection: React.FC<NotesSectionProps> = ({ userId, notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'white' });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const myNotes = notes.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAdd = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      onAddNote({
        title: newNote.title,
        content: newNote.content,
        color: newNote.color
      });
      setNewNote({ title: '', content: '', color: 'white' });
      setIsExpanded(false);
    }
  };

  const handleUpdate = () => {
    if (editingNote && (editingNote.title.trim() || editingNote.content.trim())) {
      onUpdateNote(editingNote);
      setEditingNote(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Create Note Area */}
      <div className="max-w-2xl mx-auto mt-6">
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 overflow-hidden ${isExpanded ? 'shadow-lg ring-1 ring-gray-200' : 'hover:shadow-md'}`}>
          {isExpanded ? (
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Title"
                className="w-full text-lg font-semibold placeholder-gray-500 px-4 pt-4 pb-2 outline-none text-gray-900 bg-transparent"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <textarea
                placeholder="Take a note..."
                className="w-full resize-none outline-none text-gray-800 min-h-[120px] px-4 py-2 bg-transparent text-sm leading-relaxed"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                autoFocus
              />
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <div className="relative">
                  <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                    title="Change color"
                  >
                    <Palette className="w-5 h-5" />
                  </button>
                  
                  {/* Color Picker Popover */}
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200 flex gap-1 z-10 w-[170px] flex-wrap">
                      {COLORS.map(c => (
                        <button
                          key={c.id}
                          className={`w-6 h-6 rounded-full border ${c.bg} ${c.border} hover:scale-110 transition-transform ${newNote.color === c.id ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                          onClick={() => {
                            setNewNote({ ...newNote, color: c.id });
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            setIsExpanded(false);
                            setNewNote({ title: '', content: '', color: 'white' });
                        }}
                        className="px-4 py-1.5 text-gray-600 font-medium hover:bg-gray-200 rounded-md transition-colors text-sm"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleAdd}
                        disabled={!newNote.title.trim() && !newNote.content.trim()}
                        className="px-6 py-1.5 bg-transparent text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleAdd}
                         className="px-6 py-1.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm"
                    >
                        Save
                    </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
                onClick={() => setIsExpanded(true)}
                className="p-4 flex items-center text-gray-600 cursor-text h-12"
            >
                <span className="font-medium flex-1">Take a note...</span>
                <div className="flex gap-4">
                     {/* Placeholder icons for Google Keep look */}
                     {/* <CheckSquare className="w-5 h-5 text-gray-500" />
                     <Image className="w-5 h-5 text-gray-500" /> */}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {myNotes.length === 0 ? (
         <div className="text-center py-20 opacity-60">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <StickyNote className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">Notes you add appear here</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start px-4 md:px-0">
            {myNotes.map(note => {
                const colorStyle = COLORS.find(c => c.id === note.color) || COLORS[0];
                return (
                    <div 
                        key={note.id} 
                        className={`group relative rounded-lg border p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${colorStyle.bg} ${colorStyle.border} flex flex-col min-h-[140px]`}
                        onClick={() => setEditingNote(note)}
                    >
                        {note.title && <h3 className="font-bold text-gray-900 mb-2 text-base leading-tight">{note.title}</h3>}
                        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-8 flex-grow">{note.content}</p>
                        
                        <div className="mt-auto pt-2 border-t border-black/5 flex justify-between items-center text-xs text-gray-500">
                             <div className="flex items-center">
                                <span className="font-medium">
                                    {new Date(note.createdAt).toLocaleString(undefined, {
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </span>
                             </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-lg p-1">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingNote(note);
                                }}
                                className="p-1.5 hover:bg-black/10 text-gray-600 rounded-full transition-colors"
                                title="Edit note"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteNote(note.id);
                                }}
                                className="p-1.5 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full transition-colors"
                                title="Delete note"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {/* Edit Modal */}
      {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div 
                  className={`w-full max-w-lg rounded-xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col ${
                      COLORS.find(c => c.id === editingNote.color)?.bg || 'bg-white'
                  }`}
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-4 flex flex-col h-full max-h-[80vh]">
                      <input
                        type="text"
                        placeholder="Title"
                        className="w-full text-xl font-bold placeholder-gray-500 mb-4 outline-none text-gray-900 bg-transparent"
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                      />
                      <textarea
                        placeholder="Take a note..."
                        className="w-full resize-none outline-none text-gray-800 min-h-[200px] flex-grow bg-transparent text-base leading-relaxed"
                        value={editingNote.content}
                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      />
                  </div>
                  
                  <div className="p-3 bg-black/5 border-t border-black/5 flex justify-between items-center">
                       <div className="flex gap-2 relative">
                           {/* Simplified Color Picker for Modal */}
                           <div className="flex gap-1">
                               {COLORS.slice(0, 5).map(c => (
                                   <button
                                     key={c.id}
                                     className={`w-5 h-5 rounded-full border border-gray-300 ${c.bg} ${editingNote.color === c.id ? 'ring-2 ring-gray-400' : ''}`}
                                     onClick={() => setEditingNote({ ...editingNote, color: c.id })}
                                   />
                               ))}
                           </div>
                       </div>
                       
                       <div className="flex gap-2">
                           <button 
                                onClick={() => setEditingNote(null)}
                                className="px-4 py-2 text-gray-700 hover:bg-black/5 rounded-md text-sm font-medium transition-colors"
                           >
                               Cancel
                           </button>
                           <button 
                                onClick={handleUpdate}
                                className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors shadow-sm"
                           >
                               Save
                           </button>
                       </div>
                  </div>
                  <div className="px-4 py-2 text-[10px] text-gray-400 text-right bg-black/5">
                      Edited {new Date().toLocaleString()}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default NotesSection;