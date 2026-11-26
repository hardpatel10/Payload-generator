import { CheckCircle2 } from "lucide-react";

/** Bottom-right toast stack. `toasts` = [{ id, message }]. */
export default function Toast({ toasts, offset }) {
  return (
    <div className={`pointer-events-none fixed right-4 z-[60] flex flex-col gap-2 ${offset ? "bottom-28 lg:bottom-4 lg:right-[396px]" : "bottom-4"}`} aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toastIn flex items-center gap-2 rounded-lg border border-line-hover bg-raised px-4 py-2 text-sm text-content shadow-xl shadow-black/40"
        >
          <CheckCircle2 size={16} className="text-accent-emerald" />
          {t.message}
        </div>
      ))}
    </div>
  );
}
