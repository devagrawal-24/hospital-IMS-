import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
  renderDateCell: (date: string) => React.ReactNode;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ onDateSelect, selectedDate, renderDateCell }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  // Local Date String for Today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100/50" />);
  }
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = selectedDate === dateStr;
    const isToday = dateStr === todayStr;

    days.push(
      <div 
        key={d} 
        onClick={() => onDateSelect(dateStr)}
        className={`h-24 border border-gray-100 p-2 cursor-pointer transition-all relative group ${
          isSelected ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20 ring-inset' : 'hover:bg-gray-50'
        } ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full ${
            isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 group-hover:bg-gray-200'
          }`}>
            {d}
          </span>
        </div>
        <div className="text-xs">
          {renderDateCell(dateStr)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
           <span className="capitalize">{monthName}</span> 
           <span className="text-gray-400 font-light">{year}</span>
        </h3>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days}
      </div>
    </div>
  );
};

export default AttendanceCalendar;