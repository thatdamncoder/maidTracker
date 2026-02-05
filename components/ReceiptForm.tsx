interface ReceiptFormProps {
  amount: number | string;
  note: string;
  paymentDate: string;
  preview?: string | null;
  onAmountChange: (v: number) => void;
  onNoteChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  amount,
  note,
  paymentDate,
  preview,
  onAmountChange,
  onNoteChange,
  onDateChange,
  onFileChange,
}) => (
  <div className="space-y-4">
    {onFileChange && (
      <>
        <input type="file" accept="image/*" onChange={onFileChange} />
        {preview && (
          <img src={preview} className="w-full h-40 object-cover rounded-xl" />
        )}
      </>
    )}

    <input
      type="date"
      value={paymentDate}
      onChange={(e) => onDateChange(e.target.value)}
      className="w-full border rounded-xl px-3 py-2"
    />

    <input
      type="number"
      value={amount}
      onChange={(e) => onAmountChange(Number(e.target.value))}
      className="w-full border rounded-xl px-3 py-2"
    />

    <textarea
      value={note}
      onChange={(e) => onNoteChange(e.target.value)}
      className="w-full border rounded-xl px-3 py-2"
      placeholder="Optional note"
    />
  </div>
);
