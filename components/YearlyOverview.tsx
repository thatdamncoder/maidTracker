import { format } from 'date-fns';
import { AttendanceRecord } from '@/types/types';
import { cn } from '@/lib/utils';
import { calculateYearlyLeaves } from '@/utils/calculations/leaveCalculations';
import { AlertCircle } from 'lucide-react';

interface YearlyOverviewProps {
  year: number;
  attendanceRecords: AttendanceRecord[];
  onMonthClick: (date: Date) => void;
  maidId: string;
  maxLeavesPerMonth: number;
}

export const YearlyOverview = ({ year, attendanceRecords, onMonthClick, maidId, maxLeavesPerMonth }: YearlyOverviewProps) => {
  const monthlyData = calculateYearlyLeaves(year, attendanceRecords, maxLeavesPerMonth);
  
  // Get the last month's overall pending (December or current month)
  const lastMonth = monthlyData[monthlyData.length - 1];
  const totalOverallPending = lastMonth?.overallPending || 0;

  return (
    <div className="space-y-6">
      {/* Overall Pending Display */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Pending Leaves for {year}</h3>
            <p className="text-sm text-muted-foreground">Carry-over leaves accumulated throughout the year</p>
          </div>
          <div className="text-4xl font-bold text-primary">
            {totalOverallPending}
          </div>
        </div>
      </div>
      
      {/* Monthly Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthlyData.map(data => {
          const withinLimit = data.absences <= data.maxAllowed;
          
          return (
            <button
              key={data.month.toISOString()}
              onClick={() => onMonthClick(data.month)}
              className={cn(
                "bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 text-left relative",
                !withinLimit && "ring-2 ring-destructive"
              )}
            >
              {!withinLimit && (
                <div className="absolute -top-2 -right-2 bg-destructive rounded-full p-1">
                  <AlertCircle className="h-4 w-4 text-destructive-foreground" />
                </div>
              )}
              
              <h3 className="font-semibold text-lg mb-3">{format(data.month, 'MMMM')}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Absences</span>
                  <span className={cn(
                    "font-medium",
                    !withinLimit && "text-destructive"
                  )}>
                    {data.absences} / {data.maxAllowed}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending Leaves</span>
                  <span className={cn(
                    "font-semibold text-lg",
                    withinLimit ? "text-green-600 dark:text-green-400" : "text-destructive"
                  )}>
                    {data.maxAllowed}
                  </span>
                </div>
                
                {!withinLimit && (
                  <div className="pt-2 mt-2 border-t border-destructive/20">
                    <p className="text-xs text-destructive">
                      Exceeded limit
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
