import { format, startOfYear, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
// import { AttendanceRecord } from '@/types/attendance';
export interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  status: 'present' | 'absent';
  reason?: string;
  maidId: string;
}

export interface MonthLeaveData {
  month: Date;
  absences: number;
  maxAllowed: number;
  overallPending: number;
  exceeded: boolean;
}

export const calculateYearlyLeaves = (
  year: number,
  attendanceRecords: AttendanceRecord[],
  maxLeavesPerMonth: number
): MonthLeaveData[] => {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  
  let overallPending = 0;
  const results: MonthLeaveData[] = [];
  
  for (const month of months) {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const absences = days.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const record = attendanceRecords.find(r => r.date === dateStr);
      return record?.status === 'absent';
    }).length;
    
    const available = maxLeavesPerMonth + overallPending;
    const exceeded = absences > available;
    
    if (absences <= available) {
      overallPending = available - absences;
    } else {
      overallPending = 0;
    }
    
    results.push({
      month,
      absences,
      maxAllowed: maxLeavesPerMonth,
      overallPending,
      exceeded,
    });
  }
  
  return results;
};
