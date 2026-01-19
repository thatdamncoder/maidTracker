"use client";

import { AttendanceSummary } from "@/components/AttendanceSummary";
import { MonthlySummaryCards } from "@/components/MonthlySummaryCards";
import { MonthNavigation } from "@/components/MonthNavigation";
import { YearlyOverview } from "@/components/YearlyOverview";
import { Moon, Sun, UserCircle } from "lucide-react";
import { Calendar } from "@/components/Calendar";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AttendanceDialog } from "@/components/AttendanceDialog";
import { MaidSelector } from "@/components/MaidSelector";
import { AttendanceRecord, Maid } from "@/types/types";
import { calculateYearlyLeaves } from "@/utils/calculations/leaveCalculations";

const fetchMaids = async () => {
  const response = await fetch("/api/maid");
  return response.json();
};

const fetchAttendance = async (maidId: string, year: number, month: number) => {
  const response = await fetch(
    `/api/attendance/${maidId}?year=${year}&month=${month}`
  );
  return response.json();
};

export default function Home({}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isYearView, setIsYearView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [maids, setMaids] = useState<Maid[]>([]);
  const [selectedMaidId, setSelectedMaidId] = useState<string>("");

  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  // ---------------------------
  // LOAD MAIDS INITIALLY
  // ---------------------------
  useEffect(() => {
    const loadMaids = async () => {
      const data = await fetchMaids();
      setMaids(data);

      if (data.length > 0) {
        setSelectedMaidId(data[0].id);
      }
    };

    loadMaids();
  }, []);

  // ---------------------------
  // LOAD ATTENDANCE ON CHANGE
  // ---------------------------
  useEffect(() => {
    if (!selectedMaidId) return;

    const loadAttendance = async () => {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      const data = await fetchAttendance(selectedMaidId, year, month);
      setAttendanceRecords(data);
    };

    loadAttendance();
  }, [selectedMaidId, currentDate]);

  // ---------------------------
  // SAVE ATTENDANCE ENTRY
  // ---------------------------
  const handleSaveAttendance = async (record: AttendanceRecord) => {
    const { date, reason: comment, status } = record;
    const d = new Date(date);

    await fetch(`/api/attendance`, {
      method: "POST",
      body: JSON.stringify({
        maid_id: selectedMaidId,
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        status: status === "present",
        comment,
      }),
    });

    const updated = await fetchAttendance(
      selectedMaidId,
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    setAttendanceRecords(updated);
  };

  // ---------------------------
  // ADD MAID
  // ---------------------------
  const handleAddMaid = async (maid: Maid) => {
    await fetch("/api/maid", {
      method: "POST",
      body: JSON.stringify({
        name: maid.name,
        max_leaves: maid.maxLeavesPerMonth,
      }),
    });

    const refreshed = await fetchMaids();
    setMaids(refreshed);
  };

  const currentMonthRecords = attendanceRecords.filter((r) => {
    const rd = new Date(r.date);
    return (
      rd.getMonth() === currentDate.getMonth() &&
      rd.getFullYear() === currentDate.getFullYear()
    );
  });

  const selectedMaid = maids.find((m) => m.id === selectedMaidId);
  const maxLeavesPerMonth = selectedMaid?.maxLeavesPerMonth || 4;

  const totalPresent = currentMonthRecords.filter(
    (r) => r.status === "present"
  ).length;
  const totalAbsences = currentMonthRecords.filter(
    (r) => r.status === "absent"
  ).length;

  const monthlyLeaves = calculateYearlyLeaves(
    currentDate.getFullYear(),
    attendanceRecords,
    maxLeavesPerMonth
  );

  const currentMonthIndex = currentDate.getMonth();
  const previousMonthData =
    currentMonthIndex > 0 ? monthlyLeaves[currentMonthIndex - 1] : null;

  const pendingFromPrevious = previousMonthData?.overallPending || 0;
  const exceeded = totalAbsences > maxLeavesPerMonth;

  const currentRecord = selectedDate
    ? currentMonthRecords.find(
        (r) => r.date === format(selectedDate, "yyyy-MM-dd")
      )
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-10">
        <header className="mb-8 md:mb-12">
          <div className="flex justify-between">
            <div className="flex items-center gap-3 mb-2">
              <UserCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Maid Attendance Tracker
              </h1>
            </div>
            <div className="flex gap-3">
              <Moon />
              <Sun />
            </div>
          </div>

          <p className="text-muted-foreground ml-11 mb-4">
            Track your household help's attendance effortlessly
          </p>

          <div className="ml-11">
            <MaidSelector
              maids={maids}
              selectedMaidId={selectedMaidId}
              onSelectMaid={setSelectedMaidId}
              onAddMaid={handleAddMaid}
              onUpdateMaid={() => {}}
            />
          </div>
        </header>

        <MonthNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          isYearView={isYearView}
          onYearViewToggle={() => setIsYearView(!isYearView)}
        />

        {/* EMPTY STATE IF NO MAIDS */}
        {maids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl font-semibold text-muted-foreground">
              No maids registered yet.
            </p>
            <p className="text-muted-foreground mt-2">
              Add a maid to start tracking attendance.
            </p>
          </div>
        ) : isYearView ? (
          <YearlyOverview
            year={currentDate.getFullYear()}
            attendanceRecords={attendanceRecords}
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
                pendingLeaves={pendingFromPrevious}
              />
            </div>

            <div className="lg:col-span-1 space-y-4">
              <MonthlySummaryCards
                totalPresent={totalPresent}
                totalAbsences={totalAbsences}
                maxLeavesPerMonth={maxLeavesPerMonth}
                exceeded={exceeded}
              />

              <AttendanceSummary
                records={attendanceRecords}
                onRecordClick={setSelectedDate}
              />
            </div>
          </div>
        )}
      </div>

      <AttendanceDialog
        date={selectedDate}
        currentRecord={currentRecord}
        onClose={() => setSelectedDate(null)}
        onSave={handleSaveAttendance}
        maidId={selectedMaidId}
      />
    </div>
  );
}
