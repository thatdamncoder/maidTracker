import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MonthlySummaryCardsProps {
  totalPresent: number;
  totalAbsences: number;
  maxLeavesPerMonth: number;
  exceeded: boolean;
}

export const MonthlySummaryCards = ({ 
  totalPresent, 
  totalAbsences, 
  maxLeavesPerMonth,
  exceeded 
}: MonthlySummaryCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Card className="rounded-2xl p-4 bg-present/30">
        <div className="text-sm text-muted-foreground mb-1">Present Days</div>
        <div className="text-3xl font-bold">{totalPresent}</div>
      </Card>
      <Card className="rounded-2xl p-4 bg-absent/30">
        <div className="text-sm text-muted-foreground mb-1">Absences</div>
        <div className={cn(
          "text-3xl font-bold",
          exceeded && "text-destructive"
        )}>
          {totalAbsences} / {maxLeavesPerMonth}
        </div>
      </Card>
    </div>
  );
};
