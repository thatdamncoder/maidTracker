import { PaymentReceipt } from "@/types/types";
import { useState } from "react";
import { ReceiptForm } from "./ReceiptForm";

interface ReceiptModalProps {
  receipt: PaymentReceipt;
  mode: "view" | "edit";
  onClose: () => void;
  onUpdate: (updated: PaymentReceipt) => void;
  onDelete: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  mode: initialMode,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [amount, setAmount] = useState(receipt.amount);
  const [note, setNote] = useState(receipt.note || "");
  const [date, setDate] = useState(receipt.paymentDate);

  const handleSave = () => {
    onUpdate({
      ...receipt,
      amount,
      note,
      paymentDate: date,
    });
    setMode("view");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-120 flex items-end justify-center sm:items-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {mode === "view" ? "Receipt Details" : "Edit Receipt"}
          </h3>
          <button onClick={onClose} className="text-slate-500">✕</button>
        </div>

        {/* View Mode */}
        {mode === "view" && (
          <>
            <p className="text-xl font-bold mb-1">₹{receipt.amount}</p>
            <p className="text-sm text-slate-500 mb-3">
              {new Date(receipt.paymentDate).toLocaleDateString()}
            </p>

            {receipt.note && (
              <p className="text-sm text-slate-600 mb-4">{receipt.note}</p>
            )}

            {receipt.imageUrl ? (
              <img
                src={receipt.imageUrl}
                className="w-full rounded-xl border mb-4"
              />
            ) : (
              <p className="text-sm italic text-slate-400 mb-4">
                No receipt image
              </p>
            )}

            <button
              onClick={() => setMode("edit")}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl"
            >
              Edit Receipt
            </button>

            <button
              onClick={onDelete}
              className="w-full bg-red-500 text-white py-3 rounded-xl mt-3"
            >
              Delete Receipt
            </button>
          </>
        )}

        {/* Edit Mode */}
        {mode === "edit" && (
          <>
            <ReceiptForm
              amount={amount}
              note={note}
              paymentDate={date.split("T")[0]}
              onAmountChange={setAmount}
              onNoteChange={setNote}
              onDateChange={(v) => setDate(new Date(v).toISOString())}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setMode("view")}
                className="flex-1 bg-slate-100 py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-xl"
              >
                Save
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
