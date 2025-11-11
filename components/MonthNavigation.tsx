import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onYearViewToggle: () => void;
  isYearView: boolean;
}

export const MonthNavigation = ({ 
  currentDate, 
  onDateChange, 
  onYearViewToggle,
  isYearView 
}: MonthNavigationProps) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(subMonths(currentDate, 1))}
          className="rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Select
            value={currentDate.getMonth().toString()}
            onValueChange={(value) => {
              const newDate = new Date(currentDate);
              newDate.setMonth(parseInt(value));
              onDateChange(newDate);
            }}
          >
            <SelectTrigger className="w-[130px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={currentDate.getFullYear().toString()}
            onValueChange={(value) => {
              const newDate = new Date(currentDate);
              newDate.setFullYear(parseInt(value));
              onDateChange(newDate);
            }}
          >
            <SelectTrigger className="w-[100px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(addMonths(currentDate, 1))}
          className="rounded-xl"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant={isYearView ? "default" : "outline"}
        onClick={onYearViewToggle}
        className="rounded-xl gap-2"
      >
        <CalendarIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Year View</span>
      </Button>
    </div>
  );
};
