import React, { useState, useRef, useEffect } from 'react';
import { User, Patient, AttendanceRecord, Message, Note } from '../types';
import AttendanceCalendar from '../components/AttendanceCalendar';
import NotesSection from '../components/NotesSection';
import { Clock, Calendar, UserCheck, CheckCheck, Send, Play, Square, CheckCircle, MoreVertical } from 'lucide-react';

interface DoctorDashboardProps {
  currentView: string;
  user: User;
  patients: Patient[];
  attendance: AttendanceRecord[];
  messages: Message[];
  notes: Note[];
  onPunchInOut: (userId: string) => void;
  onSendMessage: (msg: string) => void;
  onAddNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ 
  currentView, user, patients, attendance, messages, notes, onPunchInOut, onSendMessage, onAddNote, onUpdateNote, onDeleteNote
}) => {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Get Today as Local Date String YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // State moved to top level to avoid conditional hook calls
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const todayRecord = attendance.find(a => a.userId === user.id && a.date === todayStr);
  const isPunchedIn = todayRecord && todayRecord.punchIn && !todayRecord.punchOut;
  const isShiftCompleted = todayRecord && todayRecord.punchIn && todayRecord.punchOut;
  const overtime = todayRecord && todayRecord.totalHours > (user.dailyWorkHoursLimit || 8);

  const myAppointments = patients.filter(p => p.assignedDoctorId === user.id && p.status !== 'Discharged');

  // Filter messages sent by this user or sent to this user by Admin
  const myMessages = messages.filter(m => m.fromUserId === user.id || m.toUserId === user.id).sort((a,b) => 
     new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  useEffect(() => {
    if (currentView === 'messages') {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  const AttendanceSection = () => {
    const selectedRecord = attendance.find(a => a.userId === user.id && a.date === selectedDate);
    
    const renderCalendarCell = (date: string) => {
        const record = attendance.find(a => a.userId === user.id && a.date === date);
        if (!record || !record.punchIn) return null;
        
        const isOvertime = record.totalHours > user.dailyWorkHoursLimit;
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
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-blue-200 font-medium text-sm uppercase tracking-wider">Current Time</p>
                            <h2 className="text-4xl font-mono font-bold mt-1">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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
                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30' 
                                : 'bg-white text-blue-900 hover:bg-blue-50 shadow-white/10'
                        }`}
                    >
                         {isShiftCompleted ? <><CheckCircle className="w-5 h-5"/> Shift Completed</> : isPunchedIn ? <><Square className="fill-current w-5 h-5"/> Punch Out</> : <><Play className="fill-current w-5 h-5"/> Punch In</>}
                    </button>
                    
                     <div className="mt-6 flex justify-between text-sm text-blue-200 border-t border-white/10 pt-4">
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
                                    <span className="font-mono font-bold text-blue-600">{selectedRecord.totalHours.toFixed(2)} hrs</span>
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
                 <h3 className="font-bold text-lg text-gray-800 mb-4">My Attendance History</h3>
                 <AttendanceCalendar 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    renderDateCell={renderCalendarCell}
                 />
                 <div className="flex gap-4 mt-4 text-xs text-gray-500 justify-center">
                     <div className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-1" /> Present</div>
                     <div className="flex items-center"><Clock className="w-3 h-3 text-orange-500 mr-1" /> Working</div>
                     <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1" /> Overtime</div>
                 </div>
            </div>
        </div>
    );
  };

  const AppointmentsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Today's Appointments</h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {myAppointments.length} Patients
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myAppointments.map(patient => (
          <div key={patient.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-gray-800">{patient.name}</h4>
                <p className="text-sm text-gray-500">{patient.age} years old</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                {patient.appointmentTime}
              </span>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
               <p className="text-sm text-blue-800 font-medium">Reason: {patient.disease}</p>
            </div>
            
            <p className="text-sm text-gray-500 mb-4 flex-grow italic">"{patient.notes}"</p>
            
            <button className="w-full mt-auto py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
              Examine Patient
            </button>
          </div>
        ))}
        {myAppointments.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            No appointments scheduled for today.
          </div>
        )}
      </div>
    </div>
  );

  const MessageSection = () => (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)]">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
        {/* WhatsApp Header */}
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
                       Start a conversation with Admin
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

  const ProfileSection = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center">
          <UserCheck className="w-8 h-8 mr-3 text-blue-600" />
          Doctor Profile
        </h3>
        <div className="space-y-6 max-w-lg mx-auto">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-500 font-medium">Full Name</span>
            <span className="font-bold text-gray-900 text-lg">{user.name}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-500 font-medium">Role</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{user.role}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-500 font-medium">Department</span>
            <span className="font-bold text-gray-900">{user.department || 'General Practice'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-500 font-medium">Username</span>
            <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">{user.username}</span>
          </div>
          
          <div className="pt-6 mt-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Account Security</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Password</span>
                <code className="font-mono text-lg bg-white px-3 py-1 rounded border border-gray-200 text-gray-800 tracking-widest">
                    {user.password}
                </code>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentView === 'attendance' && AttendanceSection()}
      {currentView === 'appointments' && AppointmentsSection()}
      {currentView === 'messages' && MessageSection()}
      {currentView === 'profile' && ProfileSection()}
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

export default DoctorDashboard;