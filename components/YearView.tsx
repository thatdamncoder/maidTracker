
import React, { useState, useEffect } from 'react';
import { Helper, YearlyAttendance } from '@/types/types';

interface YearViewProps {
  helper: Helper;
  year: number;
}

const YearView: React.FC<YearViewProps> = ({ helper, year }) => {
  const [summary, setSummary] = useState<YearlyAttendance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchYearly = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/${helper.id}/yearly?year=${year}`);
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error("Yearly fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchYearly();
  }, [helper.id, year]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) return <div className="p-20 text-center text-slate-400">Loading yearly summary...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-outfit font-black text-slate-900 tracking-tight">{year} Recap</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {months.map((month, idx) => {
          const mIdx = idx + 1;
          const stats = summary?.summary.find(s => s.month === mIdx);
          const leaves = stats?.total_absent || 0;
          const isCurrentMonth = new Date().getMonth() === idx && new Date().getFullYear() === year;

          return (
            <div 
              key={month} 
              className={`p-6 rounded-[32px] border-2 transition-all shadow-sm hover:shadow-lg ${
                isCurrentMonth ? 'bg-white border-indigo-200 shadow-indigo-50' : 'bg-slate-50/50 border-slate-100'
              }`}
            >
              <div className="flex justify-between items-center mb-5">
                <h4 className={`font-outfit font-black text-lg ${isCurrentMonth ? 'text-indigo-700' : 'text-slate-800'}`}>{month}</h4>
                {isCurrentMonth && <span className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-tighter">Current</span>}
              </div>
              
              <div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Leaves Taken</div>
                <div className={`text-2xl font-outfit font-black ${leaves > helper.max_leaves ? 'text-rose-600' : 'text-slate-900'}`}>
                  {leaves} / {helper.max_leaves}
                </div>
              </div>

              <div className="mt-6 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${leaves > helper.max_leaves ? 'bg-rose-500' : 'bg-teal-500'}`}
                  style={{ width: `${Math.min((leaves / helper.max_leaves) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearView;
