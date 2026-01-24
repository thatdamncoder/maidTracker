
import React, { useState } from 'react';
import { PaymentReceipt } from '@/types/types';
import { uploadFileToSupabaseStorage, getPublicUrlFromSupabaseStorage } from '@/utils/supabase/storage';

interface ReceiptUploaderProps {
  maidId: string;
  receipts: PaymentReceipt[];
  onAddReceipt: (receipt: PaymentReceipt) => void;
  onDeleteReceipt: (id: string) => void;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ maidId, receipts, onAddReceipt, onDeleteReceipt }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || amount <= 0) return;

    setIsUploading(true);
    try {
      const fileName = `${maidId}/${Date.now()}-${selectedFile.name}`;
      await uploadFileToSupabaseStorage(selectedFile, 'receipts', fileName);
      const imageUrl = getPublicUrlFromSupabaseStorage('receipts', fileName);

      const response = await fetch(`/api/payments/${maidId}/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          amount,
          note,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save receipt');
      }

      const newReceipt: PaymentReceipt = await response.json();
      onAddReceipt(newReceipt);

      setAmount(0);
      setNote('');
      setPreview(null);
      setSelectedFile(null);
      setIsUploading(false);
    } catch (error) {
      console.error('Error saving receipt:', error);
      setIsUploading(false);
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;

    try {
      onDeleteReceipt(receiptId);
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-outfit font-bold text-slate-800">Payment Receipts</h2>
          <p className="text-slate-400 text-sm">Keep all your digital proofs safe</p>
        </div>
        <button
          onClick={() => setIsUploading(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-200 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Upload Receipt
        </button>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 flex flex-col items-center">
          <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">No receipts saved yet</h2>
          <p className="text-slate-500 mb-6">Upload photos of your bank transfers or cash memos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {receipts.map(receipt => (
            <div key={receipt.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group">
              <div className="h-48 bg-slate-200 relative">
                <img src={receipt.imageUrl} alt="Receipt" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl font-bold text-slate-800">₹{receipt.amount.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(receipt.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{receipt.note || 'Payment record'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-outfit font-bold text-slate-800 mb-6">Save Payment Receipt</h2>

            <div className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-3xl flex flex-col items-center justify-center overflow-hidden transition ${
                  preview ? 'border-emerald-500' : 'border-slate-200 h-48 hover:border-emerald-300'
                }`}
              >
                {preview ? (
                  <div className="w-full h-full relative group">
                    <img src={preview} className="w-full h-48 object-cover" alt="Preview" />
                    <button
                      onClick={() => { setPreview(null); setSelectedFile(null); }}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="bg-emerald-50 p-4 rounded-full mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Click to upload photo</span>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition outline-none"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Add Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition outline-none text-sm"
                  placeholder="e.g. Salary for October, including bonus..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => { setIsUploading(false); setPreview(null); setSelectedFile(null); setAmount(0); setNote(''); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedFile || amount <= 0 || isUploading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-200 transition"
                >
                  {isUploading ? 'Saving...' : 'Save Proof'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
