import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/types/types';

interface CalendarProps {
  currentDate: Date;
  attendanceRecords: AttendanceRecord[];
  onDayClick: (date: Date) => void;
  maxLeavesPerMonth: number;
  pendingLeaves: number;
}

export const Calendar = ({ currentDate, attendanceRecords, onDayClick, maxLeavesPerMonth, pendingLeaves }: CalendarProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  const getAttendanceStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceRecords.find(record => record.date === dateStr);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {days.map(day => {
            const attendance = getAttendanceStatus(day);
            const isCurrentDay = isToday(day);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDayClick(day)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105",
                  "text-sm md:text-base font-medium relative",
                  !attendance && "bg-muted/30 text-foreground hover:bg-muted/50",
                  attendance?.status === 'present' && "bg-present text-foreground",
                  attendance?.status === 'absent' && "bg-absent text-foreground",
                  isCurrentDay && "ring-2 ring-today ring-offset-2 ring-offset-background"
                )}
              >
                <span>{format(day, 'd')}</span>
                {attendance?.status === 'absent' && attendance.reason && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-6 mt-6 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-present" />
            <span className="text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-absent" />
            <span className="text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-today" />
            <span className="text-muted-foreground">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
