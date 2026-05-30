import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useT } from "../../../i18n/LanguageContext";

interface Shortcut {
  keys: string[];
  en: string;
  zh: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ["Ctrl", "K"], en: "Search template library", zh: "搜索模板库" },
  { keys: ["/"], en: "Focus search input", zh: "聚焦搜索框" },
  { keys: ["Esc"], en: "Go back / close", zh: "返回上一页 / 关闭" },
  { keys: ["←", "→"], en: "Previous / next template", zh: "上一个 / 下一个模板" },
  { keys: ["?"], en: "Toggle this help panel", zh: "打开快捷键面板" },
];

export function ShortcutPanel() {
  const { lang } = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (!open) return null;

  const tq = (en: string, zh: string) => (lang === "zh-CN" ? zh : en);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative bg-[var(--color-bench-surface-solid)] border border-[var(--color-bench-border)] rounded-2xl shadow-2xl max-w-[85vw] sm:max-w-sm w-[90%] p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">
            {tq("Keyboard Shortcuts", "快捷键")}
          </h2>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] hover:bg-[var(--color-bench-border)] transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--color-bench-bg)]/50 border border-[var(--color-bench-border)]">
              <span className="text-sm text-[var(--color-bench-text)]">{tq(s.en, s.zh)}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd key={j} className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] border border-[var(--color-bench-accent)]/20">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-center text-[var(--color-bench-muted)]">
          {tq('Press "?" to toggle this panel', '按 "?" 打开/关闭此面板')}
        </p>
      </div>
    </div>
  );
}
