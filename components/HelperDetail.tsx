"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Helper, 
  AttendanceStatus, 
  MonthlyAttendance, 
  AttendanceExceptions,
  PaymentReceipt 
} from '@/types/types';
import CalendarView from '@/components/CalendarView';
import YearView from '@/components/YearView';
import ReceiptUploader from '@/components/ReceiptUploader';

interface HelperDetailProps {
  helper: Helper;
  onUpdateHelper: (helper: Helper) => void;
  onBack: () => void;
}

export default function HelperDetail ({ helper, onUpdateHelper, onBack } : HelperDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calendar' | 'year' | 'receipts'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // API states
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance | null>(null);
  const [exceptions, setExceptions] = useState<AttendanceExceptions | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!helper?.id) return;
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    try {
      const attRes = await fetch(`/api/attendance/${helper.id}?month=${month}&year=${year}`);
      if (attRes.ok) {
        setMonthlyData(await attRes.json());
      }

      const excRes = await fetch(`/api/attendance-exceptions/${helper.id}?month=${month}&year=${year}&status=absent`);
      if (excRes.ok) {
        setExceptions(await excRes.json());
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [helper?.id, currentDate]);

  const handleUpdateAttendance = async (day: number, status: AttendanceStatus, note?: string | null) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // ✅ OPTIMISTIC UPDATE - Update UI immediately
    setMonthlyData(prev => {
      if (!prev) return prev;

      const wasPreviouslyAbsent = prev.days.find(d => d.day === day)?.status === 'absent';
      const isNowAbsent = status === 'absent';

      return {
        ...prev,
        days: prev.days.map(d =>
          d.day === day
            ? {
                ...d,
                marked: true,
                status,
                note: note ?? undefined
              }
            : d
        ),
        totalAbsent: wasPreviouslyAbsent && !isNowAbsent
          ? prev.totalAbsent - 1
          : !wasPreviouslyAbsent && isNowAbsent
          ? prev.totalAbsent + 1
          : prev.totalAbsent,
        lastMarkedDay: day
      };
    });

    // Update exceptions list optimistically
    setExceptions(prev => {
      if (!prev) return prev;

      const dateStr = new Date(year, month - 1, day).toISOString();

      if (status === 'absent') {
        // Check if exception already exists for this day
        const existingIndex = prev.notes.findIndex(
          n => new Date(n.date).getDate() === day
        );

        if (existingIndex !== -1) {
          // Update existing exception
          const updated = [...prev.notes];
          updated[existingIndex] = {
            ...updated[existingIndex],
            note: note ?? "",
            status: 'absent' as AttendanceStatus
          };

          return {
            ...prev,
            notes: updated,
            count: updated.length
          };
        }

        // Add new exception
        const newException = {
          date: dateStr,
          note: note ?? "",
          status: 'absent' as AttendanceStatus
        };

        return {
          ...prev,
          notes: [newException, ...prev.notes],
          count: prev.notes.length + 1
        };
      }

      // Status is 'present' - remove exception
      const filtered = prev.notes.filter(
        n => new Date(n.date).getDate() !== day
      );

      return {
        ...prev,
        notes: filtered,
        count: filtered.length
      };
    });

    // 🔄 Background sync with server
    try {
      const res = await fetch(`/api/attendance/${helper.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, month, year, status, note: note || "" })
      });
      
      if (!res.ok) {
        // If server update fails, rollback by refetching
        console.log(res);
        console.error("Server update failed, refetching data");
        await fetchData();
      }
    } catch (err) {
      console.error("Update failed, rolling back", err);
      // Rollback optimistic update by refetching from server
      await fetchData();
    }
  };

  const addReceipt = async (receipt: PaymentReceipt) => {
    // Update local state
    const updatedHelper = { ...helper, receipts: [receipt, ...(helper.receipts || [])] };
    onUpdateHelper(updatedHelper);
  };

  const deleteReceipt = async (rid: string) => {
    // Update local state
    const updatedHelper = { ...helper, receipts: (helper.receipts || []).filter((r:any) => r.id !== rid) };
    onUpdateHelper(updatedHelper);
  };

  const isPenalty = (monthlyData?.totalAbsent || 0) > helper.max_leaves;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 md:pb-10">
      <div className="mb-4 md:mb-10">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-xs mb-3 md:mb-6 group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-indigo-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Back
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl md:rounded-[28px] flex items-center justify-center text-white font-outfit font-black text-lg md:text-3xl shadow-xl md:shadow-2xl shadow-indigo-100 ring-2 md:ring-4 ring-indigo-50 shrink-0">
              {helper.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-outfit font-black text-slate-900 tracking-tight truncate max-w-[150px] md:max-w-none">{helper.name}</h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="bg-amber-100 text-amber-700 text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  {helper.max_leaves}d Limit
                </span>
                <span className="bg-teal-100 text-teal-700 text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  ₹{helper.salary.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setActiveTab('year')}
              className={`px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Yearly
            </button>
            <button 
              onClick={() => setActiveTab('receipts')}
              className={`px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'receipts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Receipts
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-10">
        <div className={`${activeTab === 'calendar' ? 'lg:col-span-2' : 'lg:col-span-3'} order-2 lg:order-1`}>
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-[24px] md:rounded-[40px] p-5 md:p-8 shadow-sm border border-slate-100">
              <CalendarView 
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                records={monthlyData?.days || []}
                onUpdateAttendance={(dateStr, status, note) => {
                   const day = new Date(dateStr).getDate();
                   handleUpdateAttendance(day, status, note || null);
                }}
              />
            </div>
          )}

          {activeTab === 'year' && (
            <div className="bg-white rounded-[24px] md:rounded-[40px] p-5 md:p-8 shadow-sm border border-slate-100">
              <YearView helper={helper} year={currentDate.getFullYear()} />
            </div>
          )}

          {activeTab === 'receipts' && (
            <ReceiptUploader 
              maidId={helper.id}
            />
          )}
        </div>

        {activeTab === 'calendar' && (
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-4 md:space-y-6">
            <h3 className="text-xs md:text-xl font-outfit font-black text-slate-400 md:text-slate-900 ml-1 uppercase md:normal-case tracking-widest md:tracking-normal">Analytics</h3>
            
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div className={`${isPenalty ? 'bg-rose-500 shadow-rose-100' : 'bg-white border border-slate-100 shadow-sm'} rounded-2xl md:rounded-3xl p-6 transition-colors duration-300 shadow-lg flex flex-col justify-center`}>
                <div className="flex justify-between items-center mb-2 md:mb-4">
                  <div className={`${isPenalty ? 'bg-white/20' : 'bg-indigo-50'} p-2 rounded-xl`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPenalty ? 'text-white' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isPenalty ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Holidays
                  </span>
                </div>
                <div className={`text-3xl md:text-5xl font-outfit font-black leading-tight ${isPenalty ? 'text-white' : 'text-slate-900'}`}>
                  {monthlyData?.totalAbsent || 0}<span className={`${isPenalty ? 'text-rose-100' : 'text-slate-300'} mx-2 text-2xl md:text-3xl`}>/</span>{helper.max_leaves}
                </div>
                <div className={`${isPenalty ? 'text-rose-100' : 'text-slate-400'} text-xs font-bold uppercase tracking-tight mt-1`}>
                  {isPenalty ? 'Limit Exceeded' : 'Monthly Allowance'}
                </div>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[200px]">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-outfit font-bold text-lg text-slate-800">Leave Log</h4>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                    {currentDate.toLocaleString('default', { month: 'short' })}
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {!exceptions || exceptions.notes.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center opacity-40">
                      <p className="text-xs font-medium text-slate-500 italic">No absences recorded</p>
                    </div>
                  ) : (
                    exceptions.notes.map((exc, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 hover:border-indigo-100 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-black text-slate-700 font-outfit tracking-tight">
                            {new Date(exc.date).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">
                          {exc.note || "No reason specified"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
