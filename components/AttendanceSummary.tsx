import { format, parseISO } from 'date-fns';
import { AttendanceRecord } from '@/types/types';
import { Card } from '@/components/ui/card';
import { Scroll } from 'lucide-react';

interface AttendanceSummaryProps {
  records: AttendanceRecord[];
  onRecordClick: (date: Date) => void;
}

export const AttendanceSummary = ({ records, onRecordClick }: AttendanceSummaryProps) => {
  const absences = records
    .filter(record => record.status === 'absent')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (absences.length === 0) {
    return (
      <Card className="rounded-2xl p-6 bg-card">
        <div className="text-center text-muted-foreground py-8">
          <Scroll className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No absences recorded this month</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl p-6 bg-card">
      <h3 className="font-semibold text-lg mb-4">Absences This Month</h3>
      <div className="space-y-3">
        {absences.map(record => (
          <button
            key={record.date}
            onClick={() => onRecordClick(parseISO(record.date))}
            className="w-full text-left p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-medium mb-1">
                  {format(parseISO(record.date), 'EEEE, MMMM d')}
                </p>
                {record.reason && (
                  <p className="text-sm text-muted-foreground">{record.reason}</p>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Click to edit
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
