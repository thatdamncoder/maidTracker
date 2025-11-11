"use client"
import { AttendanceSummary } from "@/components/AttendanceSummary";
import { MonthlySummaryCards } from "@/components/MonthlySummaryCards";
import { MonthNavigation } from "@/components/MonthNavigation";
import { YearlyOverview } from "@/components/YearlyOverview";
import { Moon, Sun, UserCircle } from "lucide-react";
import { Calendar } from "@/components/Calendar";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AttendanceDialog } from '@/components/AttendanceDialog';
import { MaidSelector } from '@/components/MaidSelector';
import { AttendanceRecord, Maid } from '@/types/types';
import { calculateYearlyLeaves } from '@/utils/calculations/leaveCalculations';
import { startOfMonth } from 'date-fns';


export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isYearView, setIsYearView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [maids, setMaids] = useState<Maid[]>([
    { id: '1', name: 'Main Maid', color: '150 25% 55%', maxLeavesPerMonth: 4 }
  ]);
  const [selectedMaidId, setSelectedMaidId] = useState('1');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    // Sample data - you can remove this later
    { date: format(new Date(), 'yyyy-MM-dd'), status: 'present', maidId: '1' },
  ]);

  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(
        r => r.date === record.date && r.maidId === record.maidId
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = record;
        return updated;
      }
      return [...prev, record];
    });
  };

  const handleAddMaid = (maid: Maid) => {
    setMaids(prev => [...prev, maid]);
    setSelectedMaidId(maid.id);
  };

  const handleUpdateMaid = (updatedMaid: Maid) => {
    setMaids(prev => prev.map(m => m.id === updatedMaid.id ? updatedMaid : m));
  };

  const currentMaidRecords = attendanceRecords.filter(
    record => record.maidId === selectedMaidId
  );

  const currentMonthRecords = currentMaidRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentDate.getMonth() &&
           recordDate.getFullYear() === currentDate.getFullYear();
  });

  const currentRecord = selectedDate 
    ? currentMonthRecords.find(r => r.date === format(selectedDate, 'yyyy-MM-dd'))
    : undefined;

  const selectedMaid = maids.find(m => m.id === selectedMaidId);
  const maxLeavesPerMonth = selectedMaid?.maxLeavesPerMonth || 4;
  
  // Calculate summary data for current month
  const totalPresent = currentMonthRecords.filter(r => r.status === 'present').length;
  const totalAbsences = currentMonthRecords.filter(r => r.status === 'absent').length;

  // Calculate overall pending leaves for current month
  const monthlyLeaves = calculateYearlyLeaves(
    currentDate.getFullYear(), 
    currentMaidRecords, 
    maxLeavesPerMonth
  );
  const currentMonthIndex = currentDate.getMonth();
  const currentMonthData = monthlyLeaves[currentMonthIndex];
  const previousMonthData = currentMonthIndex > 0 ? monthlyLeaves[currentMonthIndex - 1] : null;
  const overallPendingForCurrentMonth = previousMonthData?.overallPending || 0;
  const exceeded = totalAbsences > maxLeavesPerMonth;
  


  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-10">
        <header className="mb-8 md:mb-12">
          <div className="grid justif-end">
            <div className="flex items-center gap-3 mb-2">
              <UserCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Maid Attendance Tracker
              </h1>
            </div>
            <div>
              <Moon />
              <Sun />
            </div>
          </div>
          <p className="text-muted-foreground ml-11 mb-4">
            Keep track of your household help's attendance effortlessly
          </p>
          
          <div className="ml-11">
            <MaidSelector
              maids={maids}
              selectedMaidId={selectedMaidId}
              onSelectMaid={setSelectedMaidId}
              onAddMaid={handleAddMaid}
              onUpdateMaid={handleUpdateMaid}
            />
          </div>
        </header>

        <MonthNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onYearViewToggle={() => setIsYearView(!isYearView)}
          isYearView={isYearView}
        />

        {isYearView ? (
          <YearlyOverview
            year={currentDate.getFullYear()}
            attendanceRecords={currentMaidRecords}
            onMonthClick={(date) => {
              setCurrentDate(date);
              setIsYearView(false);
            }}
            maidId={selectedMaidId}
            maxLeavesPerMonth={maxLeavesPerMonth}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                currentDate={currentDate}
                attendanceRecords={currentMonthRecords}
                onDayClick={setSelectedDate}
                maxLeavesPerMonth={maxLeavesPerMonth}
                pendingLeaves={overallPendingForCurrentMonth}
              />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <MonthlySummaryCards
                totalPresent={4}
                totalAbsences={4}
                maxLeavesPerMonth={4}
                exceeded={false}
              />
              <AttendanceSummary
                records={currentMaidRecords}
                onRecordClick={setSelectedDate}
              />
            </div>
          </div>
        )
        }

        <AttendanceDialog
          date={selectedDate}
          currentRecord={currentRecord}
          onClose={() => setSelectedDate(null)}
          onSave={handleSaveAttendance}
          maidId={selectedMaidId}
        />
      
      </div>
    </div>
  );
}
