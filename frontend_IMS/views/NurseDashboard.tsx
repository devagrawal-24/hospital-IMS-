import React, { useState, useRef, useEffect } from 'react';
import { User, AttendanceRecord, Message, Note } from '../types';
import AttendanceCalendar from '../components/AttendanceCalendar';
import NotesSection from '../components/NotesSection';
import { Clock, CheckCheck, CheckCircle, Send, Play, Square, MoreVertical } from 'lucide-react';

interface NurseDashboardProps {
  currentView: string;
  user: User;
  attendance: AttendanceRecord[];
  messages: Message[];
  notes: Note[];
  onPunchInOut: (userId: string) => void;
  onSendMessage: (msg: string) => void;
  onAddNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ 
  currentView, user, attendance, messages, notes, onPunchInOut, onSendMessage, onAddNote, onUpdateNote, onDeleteNote
}) => {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // State moved to top level to ensure hook is always called
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const todayRecord = attendance.find(a => a.userId === user.id && a.date === todayStr);
  const isPunchedIn = todayRecord && todayRecord.punchIn && !todayRecord.punchOut;
  const isShiftCompleted = todayRecord && todayRecord.punchIn && todayRecord.punchOut;
  const overtime = todayRecord && todayRecord.totalHours > (user.dailyWorkHoursLimit || 8);

  const myMessages = messages.filter(m => m.fromUserId === user.id || m.toUserId === user.id).sort((a,b) => 
     new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  useEffect(() => {
    if (currentView === 'message') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  const AttendanceSection = () => {
    const selectedRecord = attendance.find(a => a.userId === user.id && a.date === selectedDate);
    
    const renderCalendarCell = (date: string) => {
        const record = attendance.find(a => a.userId === user.id && a.date === date);
        if (!record || !record.punchIn) return null;
        
        const isOvertime = record.totalHours > (user.dailyWorkHoursLimit || 8);
        const isWorking = record.punchIn && !record.punchOut;

        return (
            <div className="flex justify-center mt-1">
                {isWorking ? (
                    <Clock className="w-4 h-4 text-orange-500" />
                ) : isOvertime ? (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                )}
            </div>
        );
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Clock & Action Card */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-pink-200 font-medium text-sm uppercase tracking-wider">Current Time</p>
                            <h2 className="text-4xl font-mono font-bold mt-1">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h2>
                            <p className="text-pink-100 text-sm mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    
                    <button
                        onClick={() => !isShiftCompleted && onPunchInOut(user.id)}
                        disabled={!!isShiftCompleted}
                        className={`w-full py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3 ${
                        isShiftCompleted
                            ? 'bg-white/20 text-white cursor-not-allowed shadow-none hover:scale-100'
                            : isPunchedIn 
                                ? 'bg-white text-red-600 hover:bg-gray-50 shadow-white/20' 
                                : 'bg-white text-pink-600 hover:bg-gray-50 shadow-white/20'
                        }`}
                    >
                        {isShiftCompleted ? <><CheckCircle className="w-5 h-5"/> Shift Completed</> : isPunchedIn ? <><Square className="fill-current w-5 h-5"/> End Shift</> : <><Play className="fill-current w-5 h-5"/> Start Shift</>}
                    </button>
                    
                     <div className="mt-6 flex justify-between text-sm text-pink-100 border-t border-white/10 pt-4">
                        <span>Today's Log:</span>
                        <span className="font-mono font-bold text-white">{todayRecord ? todayRecord.totalHours.toFixed(2) : '0.00'} hrs</span>
                     </div>
                </div>

                {/* Selected Date Details */}
                {selectedDate && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                            Log for {new Date(selectedDate).toLocaleDateString()}
                        </h4>
                        {selectedRecord ? (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Punch In</span>
                                    <span className="font-mono font-medium">{new Date(selectedRecord.punchIn!).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Punch Out</span>
                                    <span className="font-mono font-medium">{selectedRecord.punchOut ? new Date(selectedRecord.punchOut).toLocaleTimeString() : '---'}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                    <span className="text-gray-800 font-semibold">Total Hours</span>
                                    <span className="font-mono font-bold text-pink-600">{selectedRecord.totalHours.toFixed(2)} hrs</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">No records found for this date.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Calendar */}
            <div>
                 <h3 className="font-bold text-lg text-gray-800 mb-4">My Shift History</h3>
                 <AttendanceCalendar 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    renderDateCell={renderCalendarCell}
                 />
                 <div className="flex gap-4 mt-4 text-xs text-gray-500 justify-center">
                     <div className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-1" /> Shift Complete</div>
                     <div className="flex items-center"><Clock className="w-3 h-3 text-orange-500 mr-1" /> Working</div>
                 </div>
            </div>
        </div>
    );
  };

  const MessageSection = () => (
    <div className="max-w-4xl mx-auto mt-4 h-[calc(100vh-140px)]">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">A</div>
                <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Administrator</h3>
                    <p className="text-xs text-gray-500">Online</p>
                </div>
            </div>
            <MoreVertical className="text-gray-500 w-5 h-5 cursor-pointer" />
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 bg-[#efeae2] p-4 overflow-y-auto" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
           {myMessages.length === 0 && (
               <div className="text-center mt-10">
                   <span className="bg-[#e1f3fb] text-gray-600 text-xs px-3 py-1.5 rounded shadow-sm">
                       Send a status report to Admin
                   </span>
               </div>
           )}
           {myMessages.map(m => {
             const isMe = m.fromUserId === user.id;
             return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-1.5 shadow-sm text-sm relative ${
                        isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                    }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        <div className="flex justify-end items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-500 min-w-fit">
                                {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                    </div>
                </div>
             );
           })}
           <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="bg-[#f0f2f5] p-3 border-t border-gray-200 shrink-0">
            <div className="flex items-end gap-2">
                <div className="flex-1 bg-white rounded-lg px-4 py-2 border border-gray-200">
                    <textarea
                        className="w-full max-h-32 min-h-[24px] bg-transparent border-none outline-none text-gray-800 resize-none py-1"
                        placeholder="Type a message"
                        rows={1}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if(message.trim()) {
                                    onSendMessage(message);
                                    setMessage('');
                                }
                            }
                        }}
                    />
                </div>
                <button 
                    onClick={() => {
                        if(message.trim()) {
                            onSendMessage(message);
                            setMessage('');
                        }
                    }}
                    disabled={!message.trim()}
                    className={`p-3 rounded-full mb-0.5 transition-colors flex items-center justify-center ${message.trim() ? 'bg-[#00a884] text-white hover:bg-[#008f6f]' : 'bg-gray-200 text-gray-400'}`}
                >
                    <Send className="w-5 h-5 ml-0.5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );

  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Hello, {user.name}</h2>
        <p className="opacity-90">Have a great shift today! Remember to check patient vitals periodically.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Pending Tasks</h3>
           <ul className="space-y-3">
             {['Check Bed 3 IV Drip', 'Update Vitals for Patient #203', 'Sterilize Equipment Room'].map((task, i) => (
               <li key={i} className="flex items-center text-gray-600 p-2 hover:bg-gray-50 rounded">
                 <div className="w-2 h-2 rounded-full bg-pink-500 mr-3"></div>
                 {task}
               </li>
             ))}
           </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Assigned Patients</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                 <div>
                   <p className="font-bold text-gray-800">Alice Johnson</p>
                   <p className="text-xs text-gray-500">Ward A - Bed 12</p>
                 </div>
                 <CheckCircle className="text-green-500 w-5 h-5" />
              </div>
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                 <div>
                   <p className="font-bold text-gray-800">Bob Williams</p>
                   <p className="text-xs text-gray-500">Ward B - Bed 04</p>
                 </div>
                 <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentView === 'attendance' && AttendanceSection()}
      {currentView === 'message' && MessageSection()}
      {currentView === 'dashboard' && DashboardOverview()}
      {currentView === 'notes' && (
        <NotesSection 
            userId={user.id} 
            notes={notes} 
            onAddNote={onAddNote} 
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote} 
        />
      )}
    </div>
  );
};

export default NurseDashboard;