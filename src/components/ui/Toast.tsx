import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons: Record<ToastType, typeof Check> = { success: Check, error: AlertTriangle, info: Info };
  const colors: Record<ToastType, string> = {
    success: "border-[var(--color-bench-success)] text-[var(--color-bench-success)]",
    error: "border-[var(--color-bench-error)] text-[var(--color-bench-error)]",
    info: "border-[var(--color-bench-accent)] text-[var(--color-bench-accent)]",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`pointer-events-auto toast-in flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-[var(--color-bench-surface-solid)] shadow-lg ${colors[t.type]} text-sm font-medium max-w-sm`}>
              <Icon size={14} />
              <span className="text-[var(--color-bench-text)]">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="ml-2 p-0.5 rounded hover:bg-[var(--color-bench-border)] cursor-pointer"><X size={12} className="text-[var(--color-bench-muted)]" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
