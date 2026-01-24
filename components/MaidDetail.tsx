"use client"
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
// AttendanceRecord is now exported from types.ts
import { Helper, AttendanceStatus, AttendanceRecord, PaymentReceipt, AttendanceDay } from '@/types/types';
import CalendarView from '@/components/CalendarView';
import YearView from '@/components/YearView';
import ReceiptUploader from '@/components/ReceiptUploader';

interface MaidDetailProps {
  maids: Helper[];
  onUpdateMaid: (maid: Helper) => void;
}

const MaidDetail: React.FC<MaidDetailProps> = ({ maids, onUpdateMaid }) => {
  const { id } = useParams<{ id: string }>();
  const maid = maids.find(m => m.id === id);
  const [activeTab, setActiveTab] = useState<'calendar' | 'year' | 'receipts'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!maid) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Maid not found</h2>
        <Link to="/" className="text-rose-500 hover:underline mt-4 block">Back to Dashboard</Link>
      </div>
    );
  }

  const updateAttendance = (date: string, status: AttendanceStatus, note?: string, reason?: string) => {
    // maid.records is now available on Helper type
    const existingIndex = maid.records.findIndex(r => r.date === date);
    let newRecords = [...maid.records];

    if (existingIndex >= 0) {
      if (status === 'unmark') {
        newRecords.splice(existingIndex, 1);
      } else {
        newRecords[existingIndex] = { date, status, note, reason };
      }
    } else if (status !== 'unmark') {
      newRecords.push({ date, status, note, reason });
    }

    onUpdateMaid({ ...maid, records: newRecords });
  };

  const addReceipt = (receipt: PaymentReceipt) => {
    onUpdateMaid({ ...maid, receipts: [receipt, ...maid.receipts] });
  };

  const deleteReceipt = (rid: string) => {
    onUpdateMaid({ ...maid, receipts: maid.receipts.filter(r => r.id !== rid) });
  };

  const monthlyStats = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const records = maid.records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const absent = records.filter(r => r.status === 'absent');
    const presentCount = records.filter(r => r.status === 'present').length;
    const totalLeaves = absent.length;

    // Convert AttendanceRecord[] to AttendanceDay[] for CalendarView compatibility
    const calendarDays: AttendanceDay[] = records.map(r => ({
      day: new Date(r.date).getDate(),
      marked: true,
      status: r.status,
      note: r.note || null
    }));

    return { 
      absent, 
      presentCount, 
      totalLeaves, 
      currentMonthRecordsCount: records.length,
      calendarDays 
    };
  }, [maid.records, currentDate]);

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-6">
        <Link to="/" className="text-slate-500 hover:text-rose-500 flex items-center gap-1 mb-4 text-sm font-medium transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Helpers
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-rose-100">
              {maid.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-outfit font-bold text-slate-800">{maid.name}</h1>
              {/* Changed monthlyLeaveLimit to max_leaves to match types.ts */}
              <p className="text-slate-400">Monthly Leave Limit: {maid.max_leaves} days</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'calendar' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Month View
            </button>
            <button 
              onClick={() => setActiveTab('year')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'year' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yearly Summary
            </button>
            <button 
              onClick={() => setActiveTab('receipts')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'receipts' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Receipts
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
              <CalendarView 
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                records={monthlyStats.calendarDays}
                onUpdateAttendance={updateAttendance}
              />
            </div>
          )}

          {activeTab === 'year' && (
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
              {/* Changed maid prop to helper prop to match YearView component */}
              <YearView helper={maid} year={currentDate.getFullYear()} />
            </div>
          )}

          {activeTab === 'receipts' && (
            <ReceiptUploader 
              receipts={maid.receipts} 
              onAddReceipt={addReceipt} 
              onDeleteReceipt={deleteReceipt} 
            />
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-outfit font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {currentDate.toLocaleString('default', { month: 'long' })} Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-rose-50 rounded-2xl">
                <span className="text-slate-600 font-medium">Leaves Taken</span>
                <span className={`font-bold text-lg ${monthlyStats.totalLeaves > maid.max_leaves ? 'text-rose-600' : 'text-slate-800'}`}>
                  {monthlyStats.totalLeaves} / {maid.max_leaves}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl text-center">
                  <div className="text-xs text-emerald-600 font-bold uppercase">Present</div>
                  <div className="text-lg font-bold text-emerald-700">{monthlyStats.presentCount}</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl text-center">
                  <div className="text-xs text-amber-600 font-bold uppercase">Unmarked</div>
                  <div className="text-lg font-bold text-amber-700">
                    {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() - monthlyStats.currentMonthRecordsCount}
                  </div>
                </div>
              </div>

              {monthlyStats.absent.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leave Reasons</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {monthlyStats.absent.map((record, i) => (
                      <div key={i} className="text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-700 mb-1">{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                        <p className="text-slate-500 leading-tight">{record.reason || 'No reason specified'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 shadow-sm text-white">
            <h3 className="font-outfit font-bold text-lg mb-3">Quick Note</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Marking attendance regularly helps in calculating accurate salary at the end of the month.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500 uppercase font-bold">
              Tip
            </div>
            <p className="text-xs text-slate-400 mt-1 italic">
              Use "Notes" for recording specific details about service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaidDetail;
