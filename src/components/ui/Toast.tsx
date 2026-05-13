import { useEffect, useState } from 'react';
import { Check, X, Info, XCircle } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

let toastListeners: ((m: ToastMessage) => void)[] = [];

export function showToast(type: ToastMessage['type'], text: string) {
  const msg: ToastMessage = { id: Date.now().toString(), type, text };
  toastListeners.forEach(fn => fn(msg));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts(prev => [...prev, msg]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== msg.id)), 3000);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter(h => h !== handler); };
  }, []);

  if (toasts.length === 0) return null;

  const colors: Record<string, string> = {
    success: 'border-[var(--color-bench-success)]/30 bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)]',
    error: 'border-[var(--color-bench-error)]/30 bg-[var(--color-bench-error)]/10 text-[var(--color-bench-error)]',
    info: 'border-[var(--color-bench-accent)]/30 bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)]',
  };

  const icons: Record<string, typeof Check> = { success: Check, error: X, info: Info };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`toast-in pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg ${colors[t.type]} group`}>
            <Icon size={16} />
            {t.text}
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-1 p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity" title="Dismiss"><XCircle size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}