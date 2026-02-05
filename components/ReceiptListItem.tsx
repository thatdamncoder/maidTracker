import { PaymentReceipt } from "@/types/types";

interface ReceiptListItemProps {
  receipt: PaymentReceipt;
  onClick: () => void;
}

export const ReceiptListItem: React.FC<ReceiptListItemProps> = ({ receipt, onClick }) => {
  return (
    <div
        onClick={onClick}
        className="group bg-white rounded-xl border border-slate-200 p-4
                    transition active:bg-slate-50 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-base font-semibold text-slate-800">
            ₹{receipt.amount}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(receipt.paymentDate).toLocaleDateString()}
          </p>
        </div>

        <span className="
            text-xs font-medium text-emerald-600
            transition
            group-hover:translate-x-0.5
            group-hover:text-emerald-700
            active:scale-95
            ">
            View →
        </span>

      </div>

      {receipt.note && (
        <p className="mt-1 text-sm text-slate-500 line-clamp-1">
          {receipt.note}
        </p>
      )}
    </div>
  );
};
