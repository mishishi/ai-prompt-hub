import { useState } from 'react';
import { Clock, ChevronRight, ChevronLeft, Copy, Trash2, Eye, RotateCcw } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';
import { useT } from '../../i18n/LanguageContext';
import type { GenHistoryEntry } from '../../hooks/useGenerationHistory';

interface Props {
  entries: GenHistoryEntry[];
  onClearAll: () => void;
  onLoad: (entry: GenHistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ entries, onClearAll, onLoad, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t, lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return tq(s + 's ago', s + '秒前');
    if (s < 3600) return tq(Math.floor(s / 60) + 'm ago', Math.floor(s / 60) + '分钟前');
    if (s < 86400) return tq(Math.floor(s / 3600) + 'h ago', Math.floor(s / 3600) + '小时前');
    return tq(Math.floor(s / 86400) + 'd ago', Math.floor(s / 86400) + '天前');
  };

  const previewLine = (text: string) => text.split('\n')[0].slice(0, 60);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center gap-0.5 px-1.5 py-6 rounded-l-lg bg-[var(--color-bench-elevated)] border border-r-0 border-[var(--color-bench-border)] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-accent)] transition-colors"
        title={tq('Generation History', '生成历史')}
      >
        {open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        <Clock size={12} />
      </button>

      {/* Panel */}
      <div
        className={`flex-shrink-0 border-l border-[var(--color-bench-border)] bg-[var(--color-bench-bg)] flex flex-col transition-all duration-300 overflow-hidden ${
          open ? 'w-[320px]' : 'w-0 border-l-0'
        }`}
      >
        <div className="px-4 py-3.5 border-b border-[var(--color-bench-border)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--color-bench-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">
              {tq('Generation History', '生成历史')}
            </h3>
            <span className="text-[11px] text-[var(--color-bench-muted)] bg-[var(--color-bench-elevated)] px-1.5 py-0.5 rounded-full">
              {entries.length}
            </span>
          </div>
          {entries.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-error)] transition-colors"
            >
              {tq('Clear all', '清空')}
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-sm text-[var(--color-bench-muted)]">
              {tq('No history yet. Generate a prompt to see it here.', '暂无历史记录，生成 Prompt 后这里会显示。')}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {entries.map(entry => (
              <div key={entry.id} className="border-b border-[var(--color-bench-border)]/50">
                <button
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--color-bench-elevated)]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--color-bench-text)] truncate font-medium">
                        {entry.intent || tq('Untitled', '未命名')}
                      </p>
                      <p className="text-xs text-[var(--color-bench-muted)] mt-1 truncate">
                        {previewLine(entry.result)}
                      </p>
                    </div>
                    <span className="text-[11px] text-[var(--color-bench-muted)]/60 flex-shrink-0 mt-0.5">
                      {timeAgo(entry.timestamp)}
                    </span>
                  </div>
                </button>

                {expandedId === entry.id && (
                  <div className="px-4 pb-3">
                    <div className="bg-[var(--color-bench-elevated)] rounded-lg p-3 mb-2.5 max-h-[200px] overflow-y-auto">
                      <pre className="text-sm text-[var(--color-bench-text)] whitespace-pre-wrap font-mono leading-relaxed">
                        {entry.result}
                      </pre>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onLoad(entry); }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20 transition-colors"
                      >
                        <Eye size={11} />
                        {tq('Load', '加载')}
                      </button>
                      <button
                        onClick={async (e) => { e.stopPropagation(); await copyToClipboard(entry.result); }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-[var(--color-bench-elevated)] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors"
                      >
                        <Copy size={11} />
                        {tq('Copy', '复制')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-[var(--color-bench-elevated)] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-error)] transition-colors ml-auto"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}