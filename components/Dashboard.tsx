
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helper } from '@/types/types';

interface DashboardProps {
  helpers: Helper[];
  onAddHelper: (helper: Helper) => void;
  onDeleteHelper: (id: string) => void;
  isCloudEnabled?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ helpers, onAddHelper, onDeleteHelper, isCloudEnabled }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLeaves, setNewLeaves] = useState(2);
  const [newSalary, setNewSalary] = useState(5000);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSaving) return;

    setIsSaving(true);
    const newHelper: Helper = {
      id: crypto.randomUUID(),
      name: newName,
      monthlyLeaveLimit: newLeaves,
      salary: newSalary,
      startDate: new Date().toISOString().split('T')[0],
      records: [],
      receipts: []
    };

    try {
      await onAddHelper(newHelper);
      setNewName('');
      setShowAddModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-outfit font-black text-slate-900 tracking-tight">Trackers</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isCloudEnabled ? 'bg-teal-500' : 'bg-amber-500'}`}></div>
            <p className="text-slate-500 text-sm font-medium">
              {isCloudEnabled ? 'Cloud Synced' : 'Local Storage (Offline)'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Provider
        </button>
      </div>

      {helpers.length === 0 ? (
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-16 text-center border-2 border-dashed border-slate-200 flex flex-col items-center">
          <div className="bg-indigo-50 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-outfit font-bold text-slate-800 mb-2">Ready to Track</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">Your data is stored {isCloudEnabled ? 'in the cloud' : 'locally on this device'}. Add your first tracker to begin.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-4 decoration-2"
          >
            Create first tracker &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {helpers.map(helper => {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const currentMonthRecords = (helper.records || []).filter(r => {
              const d = new Date(r.date);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            const leavesTaken = currentMonthRecords.filter(r => r.status === 'absent').length;
            // const halfDays = currentMonthRecords.filter(r => r.status === 'half-day').length;
            const halfDays = 0;
            const totalLeaves = leavesTaken + (halfDays * 0.5);

            return (
              <div key={helper.id} className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-6 relative">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-outfit font-black text-xl md:text-2xl shadow-lg shadow-indigo-100">
                      {helper.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-lg md:text-xl text-slate-900">{helper.name}</h3>
                      <p className="text-slate-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                        {helper.monthlyLeaveLimit} Allowed/mo
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(confirm(`Stop tracking ${helper.name}?`)) onDeleteHelper(helper.id) }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-all bg-slate-50 rounded-xl hover:bg-rose-50 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-slate-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-100/50">
                    <div className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Status</div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full ${totalLeaves > helper.monthlyLeaveLimit ? 'bg-rose-500 animate-pulse' : 'bg-teal-500'}`}></div>
                      <span className={`text-[10px] md:text-sm font-bold truncate ${totalLeaves > helper.monthlyLeaveLimit ? 'text-rose-600' : 'text-teal-600'}`}>
                        {totalLeaves > helper.monthlyLeaveLimit ? 'Exceeded' : 'On Track'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-100/50 text-right">
                    <div className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Taken</div>
                    <div className="text-base md:text-xl font-outfit font-black text-slate-900">
                      {totalLeaves}<span className="text-slate-300 mx-1">/</span>{helper.monthlyLeaveLimit}
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/helper/${helper.id}`}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3.5 md:py-4 rounded-2xl block text-center transition-all shadow-lg active:scale-95 text-sm md:text-base"
                >
                  Manage Attendance
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[32px] md:rounded-[40px] shadow-2xl p-8 md:p-10 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl md:text-3xl font-outfit font-black text-slate-900 mb-1">New Tracker</h2>
            <p className="text-slate-500 font-medium mb-6 md:mb-8 text-sm">Provider will be saved to your {isCloudEnabled ? 'cloud account' : 'local device'}</p>
            <form onSubmit={handleAdd} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  disabled={isSaving}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 md:px-5 py-3.5 md:py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm disabled:opacity-50"
                  placeholder="e.g. Milkman"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Leave Limit</label>
                  <input 
                    type="number" 
                    required
                    disabled={isSaving}
                    value={newLeaves}
                    onChange={(e) => setNewLeaves(parseInt(e.target.value))}
                    className="w-full px-4 md:px-5 py-3.5 md:py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Salary (₹)</label>
                  <input 
                    type="number" 
                    required
                    disabled={isSaving}
                    value={newSalary}
                    onChange={(e) => setNewSalary(parseInt(e.target.value))}
                    className="w-full px-4 md:px-5 py-3.5 md:py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3 md:gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSaving}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 md:py-4 rounded-2xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 md:py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {isSaving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
