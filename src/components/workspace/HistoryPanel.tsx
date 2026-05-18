import { Clock, Copy, Trash2, Eye, X, ChevronRight } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';
import { useT } from '../../i18n/LanguageContext';
import type { GenHistoryEntry } from '../../hooks/useGenerationHistory';

interface Props {
  open: boolean;
  onClose: () => void;
  entries: GenHistoryEntry[];
  onClearAll: () => void;
  onLoad: (entry: GenHistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ open, onClose, entries, onClearAll, onLoad, onDelete }: Props) {
  const { lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return tq(s + 's ago', s + '秒前');
    if (s < 3600) return tq(Math.floor(s / 60) + 'm ago', Math.floor(s / 60) + '分钟前');
    if (s < 86400) return tq(Math.floor(s / 3600) + 'h ago', Math.floor(s / 3600) + '小时前');
    return tq(Math.floor(s / 86400) + 'd ago', Math.floor(s / 86400) + '天前');
  };

  if (!open) return null;

  return (
    <div className="flex-shrink-0 w-[320px] border-l border-[var(--color-bench-border)] bg-[var(--color-bench-bg)] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[var(--color-bench-border)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[var(--color-bench-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">
            {tq('History', '生成历史')}
          </h3>
          <span className="text-[11px] text-[var(--color-bench-muted)] bg-[var(--color-bench-elevated)] px-1.5 py-0.5 rounded-full">
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button onClick={onClearAll} className="text-[11px] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-error)] transition-colors">
              {tq('Clear', '清空')}
            </button>
          )}
          <button onClick={onClose} className="text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-[var(--color-bench-muted)] text-center">
            {tq('No history yet.\nGenerate a prompt first.', '暂无历史记录，\n生成 Prompt 后这里会显示。')}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {entries.map(entry => (
            <div key={entry.id} className="border-b border-[var(--color-bench-border)]/50">
              <div className="px-4 py-3 hover:bg-[var(--color-bench-elevated)]/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-bench-text)] truncate font-medium">
                      {entry.intent || tq('Untitled', '未命名')}
                    </p>
                    <p className="text-xs text-[var(--color-bench-muted)] mt-1 line-clamp-2">
                      {entry.result}
                    </p>
                  </div>
                  <span className="text-[11px] text-[var(--color-bench-muted)]/60 flex-shrink-0 mt-0.5">
                    {timeAgo(entry.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => onLoad(entry)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20 transition-colors"
                  >
                    <Eye size={11} />
                    {tq('Load', '加载')}
                  </button>
                  <button
                    onClick={async () => { await copyToClipboard(entry.result); }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-[var(--color-bench-elevated)] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors"
                  >
                    <Copy size={11} />
                    {tq('Copy', '复制')}
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-[var(--color-bench-elevated)] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-error)] transition-colors ml-auto"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}