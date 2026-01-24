"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Helper } from '@/types/types';

interface DashboardProps {
  helpers: Helper[];
  onAddHelper: (helper: Helper) => void;
  onDeleteHelper: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ helpers, onAddHelper, onDeleteHelper }) => {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLeaves, setNewLeaves] = useState(4);
  const [newSalary, setNewSalary] = useState(3000);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/maids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          salary: newSalary,
          max_leaves: newLeaves,
          joined_on: new Date().toISOString().split('T')[0]
        })
      });
      
      if (res.ok) {
        const maid = await res.json();
        onAddHelper(maid);
        setNewName('');
        setNewLeaves(4);
        setNewSalary(3000);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error("Failed to add maid", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (helperId: string) => {
    if (!confirm("Delete this member?")) return;

    try {
      const res = await fetch(`/api/maids/${helperId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDeleteHelper(helperId);
      } else {
        console.error("Failed to delete helper");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };


  const navigateToHelper = (id: string) => {
    router.push(`/dashboard/helper/${id}`);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-outfit font-black text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 font-medium">Track attendance and leaves effortlessly.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          Add New Helper
        </button>
      </div>

      {helpers.length === 0 ? (
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-16 text-center border-2 border-dashed border-slate-200 flex flex-col items-center">
          <div className="bg-indigo-50 p-6 rounded-3xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-outfit font-bold text-slate-800 mb-2">No Staff Members Yet</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">Add your first staff member to start tracking their attendance and leaves.</p>
          <button onClick={() => setShowAddModal(true)} className="text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-4 decoration-2">Add Helper &rarr;</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {helpers.map(helper => (
            <div key={helper.id} className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 relative">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-outfit font-black text-xl md:text-2xl shadow-lg shadow-indigo-100">
                    {helper.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-lg md:text-xl text-slate-900">{helper.name}</h3>
                    <p className="text-slate-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">{helper.max_leaves} Max Leaves/mo</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(helper.id)} 
                  className="p-2 text-slate-300 hover:text-rose-500 transition-all bg-slate-50 rounded-xl md:opacity-0 md:group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100/50">
                  <div className="text-[8px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Salary</div>
                  <div className="text-base font-outfit font-black text-slate-900">₹{helper.salary}</div>
                </div>
                <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100/50 text-right">
                  <div className="text-[8px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Joined On</div>
                  <div className="text-sm font-outfit font-bold text-slate-900">{new Date(helper.joined_on).toLocaleDateString()}</div>
                </div>
              </div>

              <button 
                onClick={() => navigateToHelper(helper.id)}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg text-sm"
              >
                Manage Attendance
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[32px] md:rounded-[40px] shadow-2xl p-8 md:p-10 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-outfit font-black text-slate-900 mb-1">New Tracker</h2>
            <form onSubmit={handleAdd} className="space-y-4 md:space-y-6 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input type="text" autoFocus required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" placeholder="e.g. Mamta" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Monthly Leave Limit</label>
                  <input type="number" required value={newLeaves} onChange={(e) => setNewLeaves(parseInt(e.target.value))} className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Salary (₹)</label>
                  <input type="number" required value={newSalary} onChange={(e) => setNewSalary(parseInt(e.target.value))} className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? 'Saving...' : 'Create Tracker'}
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