import React, { useState, useRef, useEffect } from 'react';
import { User, AttendanceRecord, InventoryItem, Message, Note } from '../types';
import AttendanceCalendar from '../components/AttendanceCalendar';
import NotesSection from '../components/NotesSection';
import { Clock, CheckCheck, AlertCircle, ClipboardList, Send, Play, Square, CheckCircle, MoreVertical, X, Package } from 'lucide-react';

interface StaffDashboardProps {
  currentView: string;
  user: User;
  attendance: AttendanceRecord[];
  inventory: InventoryItem[];
  messages: Message[];
  notes: Note[];
  onPunchInOut: (userId: string) => void;
  onSendMessage: (msg: string) => void;
  onAddNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onUpdateInventory: (item: InventoryItem) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ 
  currentView, user, attendance, inventory, messages, notes, onPunchInOut, onSendMessage, onAddNote, onUpdateNote, onDeleteNote, onUpdateInventory
}) => {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Inventory Update State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<number | ''>('');

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

  const handleUpdateClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity);
    setIsUpdateModalOpen(true);
  };

  const handleSaveStock = () => {
    if (selectedItem && newQuantity !== '') {
        onUpdateInventory({
            ...selectedItem,
            quantity: Number(newQuantity)
        });
        setIsUpdateModalOpen(false);
        setSelectedItem(null);
    }
  };

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
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-purple-200 font-medium text-sm uppercase tracking-wider">Current Time</p>
                            <h2 className="text-4xl font-mono font-bold mt-1">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h2>
                            <p className="text-purple-100 text-sm mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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
                                : 'bg-white text-purple-600 hover:bg-gray-50 shadow-white/20'
                        }`}
                    >
                         {isShiftCompleted ? <><CheckCircle className="w-5 h-5"/> Shift Completed</> : isPunchedIn ? <><Square className="fill-current w-5 h-5"/> Punch Out</> : <><Play className="fill-current w-5 h-5"/> Clock In</>}
                    </button>
                    
                     <div className="mt-6 flex justify-between text-sm text-purple-100 border-t border-white/10 pt-4">
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
                                    <span className="text-gray-500 text-sm">Clock In</span>
                                    <span className="font-mono font-medium">{new Date(selectedRecord.punchIn!).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Clock Out</span>
                                    <span className="font-mono font-medium">{selectedRecord.punchOut ? new Date(selectedRecord.punchOut).toLocaleTimeString() : '---'}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                    <span className="text-gray-800 font-semibold">Total Hours</span>
                                    <span className="font-mono font-bold text-purple-600">{selectedRecord.totalHours.toFixed(2)} hrs</span>
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
                 <h3 className="font-bold text-lg text-gray-800 mb-4">My Attendance Record</h3>
                 <AttendanceCalendar 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    renderDateCell={renderCalendarCell}
                 />
                 <div className="flex gap-4 mt-4 text-xs text-gray-500 justify-center">
                     <div className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-1" /> On Time</div>
                     <div className="flex items-center"><Clock className="w-3 h-3 text-orange-500 mr-1" /> Active</div>
                 </div>
            </div>
        </div>
    );
  };

  const InventoryTasks = () => (
     <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-6 border-b border-gray-100 flex items-center">
         <ClipboardList className="w-6 h-6 text-purple-600 mr-3" />
        <h3 className="text-lg font-bold text-gray-800">Assigned Inventory Checks</h3>
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
          <tr>
            <th className="p-4">Item</th>
            <th className="p-4">Current Stock</th>
            <th className="p-4">Status</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {inventory.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="p-4 font-medium">{item.name}</td>
              <td className="p-4">{item.quantity} {item.unit}</td>
              <td className="p-4">
                {item.quantity < item.minThreshold ? (
                  <span className="text-red-600 text-sm font-bold bg-red-50 px-2 py-1 rounded">Restock Needed</span>
                ) : (
                  <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded">OK</span>
                )}
              </td>
              <td className="p-4">
                 <button 
                    onClick={() => handleUpdateClick(item)}
                    className="text-purple-600 text-sm font-medium hover:underline focus:outline-none"
                 >
                    Update Count
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Stock Modal */}
      {isUpdateModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Update Stock
                </h3>
                <button 
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Item Name</label>
                      <div className="text-gray-900 font-medium">{selectedItem.name}</div>
                  </div>
                  
                  <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Current Quantity</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Enter new quantity"
                      />
                      <p className="text-xs text-gray-400 mt-1">Unit: {selectedItem.unit}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setIsUpdateModalOpen(false)}
                        className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveStock}
                        disabled={newQuantity === ''}
                        className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                  </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );

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

  return (
    <div>
      {currentView === 'attendance' && AttendanceSection()}
      {currentView === 'inventory' && InventoryTasks()}
      {currentView === 'message' && MessageSection()}
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

export default StaffDashboard;