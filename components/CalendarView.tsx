
import React, { useState } from 'react';
import { AttendanceStatus, AttendanceDay } from '@/types/types';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  records: AttendanceDay[];
  onUpdateAttendance: (date: string, status: AttendanceStatus, note?: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  currentDate, 
  onDateChange, 
  records, 
  onUpdateAttendance 
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('present');
  const [editNote, setEditNote] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => onDateChange(new Date(year, month - 1, 1));
  const nextMonth = () => onDateChange(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const record = records.find(r => r.day === day);
    setSelectedDay(day);
    setEditStatus(record?.status || 'present');
    setEditNote(record?.note || '');
  };

  const handleSave = () => {
    if (selectedDay) {
      const dateStr =
        `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

      onUpdateAttendance(dateStr, editStatus, editNote);
      setSelectedDay(null);
    }
  };


  const renderDays = () => {
    const days = [];
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    weekdays.forEach((wd, i) => {
      days.push(
        <div key={`wd-${i}`} className="text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {wd}
        </div>
      );
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-1" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const record = records.find(r => r.day === i);
      const isToday = new Date().getDate() === i && 
                      new Date().getMonth() === month && 
                      new Date().getFullYear() === year;

      let statusStyles = 'hover:bg-indigo-50 text-slate-700 bg-slate-50/50';
      if (record?.marked) {
        if (record.status === 'present') statusStyles = 'bg-teal-50 text-teal-700 border-2 border-teal-100';
        if (record.status === 'absent') statusStyles = 'bg-rose-50 text-rose-700 border-2 border-rose-100';
      }

      days.push(
        <button
          key={`day-${i}`}
          onClick={() => handleDayClick(i)}
          className={`relative h-14 md:h-20 p-1 rounded-xl md:rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 group ${statusStyles}`}
        >
          <span className={`text-base md:text-xl font-outfit font-black ${isToday ? 'text-indigo-600 underline decoration-2 underline-offset-2' : ''}`}>
            {i}
          </span>
          {record?.marked && (
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-current opacity-40"></div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h2 className="text-xl md:text-2xl font-outfit font-black text-slate-900 tracking-tight">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="p-2.5 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-3">
        {renderDays()}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-sm rounded-t-[32px] md:rounded-[40px] shadow-2xl p-8 md:p-10 animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl md:text-2xl font-outfit font-black text-slate-900 mb-1">
              {selectedDay} {currentDate.toLocaleString('default', { month: 'short' })}
            </h3>
            <p className="text-slate-500 font-medium mb-6 md:mb-8 text-xs md:text-sm">Log daily activity</p>

            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['present', 'absent', 'unmark'] as AttendanceStatus[]).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditStatus(status)}
                      className={`py-2.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                        editStatus === status 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Note</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium min-h-[80px]"
                  placeholder="Record details..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedDay(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all text-sm">Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-indigo-100 transition-all text-sm">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
