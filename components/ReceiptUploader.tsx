"use client";

import React, { useEffect, useState } from "react";
import { PaymentReceipt } from "@/types/types";
import { ReceiptModal } from "./ReceiptModal";
import { ReceiptListItem } from "./ReceiptListItem";

interface ReceiptUploaderProps {
  maidId: string;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ maidId }) => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeReceipt, setActiveReceipt] =
    useState<PaymentReceipt | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* ---------------- Fetch receipts ---------------- */
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await fetch(`/api/payments/${maidId}/receipts`);
        if (!res.ok) throw new Error("Failed to fetch receipts");
        setReceipts(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [maidId]);

  /* ---------------- Upload helpers ---------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setPreview(null);
    setAmount("");
    setNote("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
  };

  /* ---------------- Create receipt ---------------- */
  const handleSave = async () => {
    if (!selectedFile || Number(amount) <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch(`/api/payments/${maidId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const { imagePath, signedUrl } = await uploadRes.json();

      const res = await fetch(`/api/payments/${maidId}/receipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePath,
          amount: Number(amount),
          note,
          date: new Date(paymentDate).toISOString(),
        }),
      });

      const newReceipt = await res.json();
      setReceipts((prev) => [{ ...newReceipt, imageUrl: signedUrl }, ...prev]);
      setShowUploadModal(false);
      resetUploadState();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (updated: PaymentReceipt) => {
  const res = await fetch(
    `/api/payments/${maidId}/${updated.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }
  );

  const saved = await res.json();

  setReceipts(prev =>
    prev.map(r => r.id === saved.id ? saved : r)
  );
};


  /* ---------------- Delete receipt ---------------- */
  const handleDelete = async (receipt: PaymentReceipt) => {
    if (!confirm("Delete this receipt?")) return;

    await fetch(`/api/payments/${maidId}/${receipt.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_path: receipt.imagePath }),
    });

    setReceipts((prev) => prev.filter((r) => r.id !== receipt.id));
  };

  if (loading) {
    return <div className="text-slate-400">Loading receipts…</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Payment Receipts
          </h2>
          <p className="text-sm text-slate-400">
            Keep all payment proofs safe
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl shadow"
        >
          Upload
        </button>
      </div>

      {/* Empty state */}
      {receipts.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-10 text-center text-slate-500">
          No receipts yet
        </div>
      ) : (
        <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
          {receipts.map((r) => (
            <ReceiptListItem
              key={r.id}
              receipt={r}
              onClick={() => setActiveReceipt(r)}
            />
          ))}
        </div>
      )}

      {/* View / Edit Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          mode="view"
          onClose={() => setActiveReceipt(null)}
          onDelete={() => handleDelete(activeReceipt)}
          onUpdate={(updated) => {
            setReceipts((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
            setActiveReceipt(updated);
          }}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Upload Receipt</h3>

            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                className="w-full h-40 object-cover rounded-xl"
              />
            )}

            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />

            <textarea
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadState();
                }}
                className="flex-1 border rounded-xl py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-2"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
