
export type AttendanceStatus = 'present' | 'absent' | 'unmark';

export interface Maid {
  id: string;
  user_id: string;
  name: string;
  salary: number;
  max_leaves: number;
  is_active: boolean;
  joined_on: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceDay {
  day: number;
  marked: boolean;
  status?: AttendanceStatus;
  note?: string | null;
}

export interface MonthlyAttendance {
  month: number;
  year: number;
  totalAbsent: number;
  lastMarkedDay: number;
  days: AttendanceDay[];
}

export interface ExceptionNote {
  date: string;
  status: AttendanceStatus;
  note: string;
}

export interface AttendanceExceptions {
  month: number;
  year: number;
  count: number;
  notes: ExceptionNote[];
}

export interface YearlySummaryItem {
  month: number;
  total_absent: number;
}

export interface YearlyAttendance {
  year: number;
  summary: YearlySummaryItem[];
}

export interface PaymentReceipt {
  id: string;
  date: string;
  amount: number;
  imageUrl: string;
  note?: string;
}

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  note?: string;
  reason?: string;
}

// UI wrapper for Maid that includes frontend-managed receipts and records
export type Helper = Maid & { 
  receipts: PaymentReceipt[];
  records: AttendanceRecord[];
};
