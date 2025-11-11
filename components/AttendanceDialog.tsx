import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AttendanceRecord } from '@/types/types';

interface AttendanceDialogProps {
  date: Date | null;
  currentRecord?: AttendanceRecord;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
  maidId: string;
}

export const AttendanceDialog = ({ date, currentRecord, onClose, onSave, maidId }: AttendanceDialogProps) => {
  const [status, setStatus] = useState<'present' | 'absent'>(currentRecord?.status || 'present');
  const [reason, setReason] = useState(currentRecord?.reason || '');

  if (!date) return null;

  const handleSave = () => {
    onSave({
      date: format(date, 'yyyy-MM-dd'),
      status,
      reason: status === 'absent' ? reason : undefined,
      maidId,
    });
    onClose();
  };

  return (
    <Dialog open={!!date} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Attendance for {format(date, 'MMMM d, yyyy')}</DialogTitle>
          <DialogDescription>
            Mark attendance and add notes if needed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Status</Label>
            <RadioGroup value={status} onValueChange={(value) => setStatus(value as 'present' | 'absent')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="present" id="present" />
                <Label htmlFor="present" className="font-normal cursor-pointer">Present</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absent" id="absent" />
                <Label htmlFor="absent" className="font-normal cursor-pointer">Absent</Label>
              </div>
            </RadioGroup>
          </div>
          
          
          <div className="space-y-2">
            <Label htmlFor="reason">{status == "absent" ? "Reason for absence" : "Additional Note"}</Label>
            <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Sick leave, Personal work, Festival..."
                className="rounded-xl resize-none"
                rows={3}
            />
           </div>
          
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 rounded-xl">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
