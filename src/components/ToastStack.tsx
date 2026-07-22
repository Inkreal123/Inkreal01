import { useApp } from "../lib/store";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export default function ToastStack() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? XCircle : Info;
        const color =
          toast.type === "success"
            ? "text-emerald-400"
            : toast.type === "error"
            ? "text-red-400"
            : "text-accent-400";
        const border =
          toast.type === "success"
            ? "border-emerald-500/30"
            : toast.type === "error"
            ? "border-red-500/30"
            : "border-accent-500/30";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${border} bg-ink-900/95 px-4 py-3 shadow-2xl backdrop-blur-md animate-slide-in-right`}
          >
            <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${color}`} />
            <p className="flex-1 text-sm text-ink-100">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-ink-400 transition-colors hover:text-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
