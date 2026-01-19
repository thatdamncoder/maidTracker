export interface YearlyOverviewProps {
  year: number;
  attendanceRecords: AttendanceRecord[];
  onMonthClick: (date: Date) => void;
  maidId: string;
  maxLeavesPerMonth: number;
}
export interface AttendanceRecord {
  maidId: string;
  date: string;
  status: 'present' | 'absent';
  reason?: string;
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
  created_at: Date;
  name: string;
  maxLeavesPerMonth: number;
  joined_on: Date;
  is_active: boolean;
}

export interface Helper {
  id: string;
  name: string;
  monthlyLeaveLimit: number;
  salary: number;
  startDate: string;
  records: AttendanceRecord[];
  receipts: PaymentReceipt[];
}

export interface PaymentReceipt {
  id: string;
  date: string;
  amount: number;
  imageUrl: string;
  note?: string;
}