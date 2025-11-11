export interface YearlyOverviewProps {
  year: number;
  attendanceRecords: AttendanceRecord[];
  onMonthClick: (date: Date) => void;
  maidId: string;
  maxLeavesPerMonth: number;
}
export interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  status: 'present' | 'absent';
  reason?: string;
  maidId: string;
}

export interface CalendarProps {
  currentDate: Date;
  attendanceRecords: AttendanceRecord[];
  onDayClick: (date: Date) => void;
  maxLeavesPerMonth: number;
  pendingLeaves: number;
}

export interface Maid {
  id: string;
  name: string;
  color: string;
  maxLeavesPerMonth: number;
}