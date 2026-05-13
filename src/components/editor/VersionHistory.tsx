import { useState } from 'react';
import { Clock, RotateCcw, GitCompare, X, ArrowRight } from 'lucide-react';
import { getPrompt, rollbackToVersion } from '../../store/myTemplates';
import type { PromptVersion } from '../../types';

interface Props {
  promptId: string;
  onRollback: (yaml: string) => void;
  onClose: () => void;
  lang: 'en' | 'zh-CN';
}

function timeAgo(ts: number, t: (en: string, zh: string) => string): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return tq('just now', '刚刚');
  if (mins < 60) return tq(`${mins}m ago`, `${mins} 分钟前`);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return tq(`${hours}h ago`, `${hours} 小时前`);
  const days = Math.floor(hours / 24);
  return tq(`${days}d ago`, `${days} 天前`);
}

function computeDiff(oldYaml: string, newYaml: string): { type: 'same' | 'add' | 'remove'; text: string }[] {
  const oldLines = oldYaml.split('\n');
  const newLines = newYaml.split('\n');
  const maxLen = Math.max(oldLines.length, newLines.length);
  const result: { type: 'same' | 'add' | 'remove'; text: string }[] = [];

  // Simple LCS-based diff
  const lcs: number[][] = Array(oldLines.length + 1).fill(null).map(() => Array(newLines.length + 1).fill(0));
  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) lcs[i][j] = lcs[i - 1][j - 1] + 1;
      else lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }

  const diff: { type: 'same' | 'add' | 'remove'; text: string }[] = [];
  let i = oldLines.length, j = newLines.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.unshift({ type: 'same', text: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      diff.unshift({ type: 'add', text: newLines[j - 1] });
      j--;
    } else {
      diff.unshift({ type: 'remove', text: oldLines[i - 1] });
      i--;
    }
  }
  return diff;
}

export function VersionHistory({ promptId, onRollback, onClose, lang }: Props) {
  const [versions, setVersions] = useState<PromptVersion[]>(() => {
    const p = getPrompt(promptId);
    return p?.versions || [];
  });
  const [diffMode, setDiffMode] = useState(false);
  const [leftVer, setLeftVer] = useState<number | null>(null);
  const [rightVer, setRightVer] = useState<number | null>(null);
  const [diffResult, setDiffResult] = useState<{ type: 'same' | 'add' | 'remove'; text: string }[]>([]);

  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  const handleRollback = (ver: number) => {
    const v = versions.find(x => x.version === ver);
    if (v) {
      rollbackToVersion(promptId, ver);
      onRollback(v.yaml);
    }
  };

  const handleCompare = () => {
    if (leftVer === null || rightVer === null) return;
    const l = versions.find(v => v.version === leftVer);
    const r = versions.find(v => v.version === rightVer);
    if (l && r) {
      setDiffResult(computeDiff(l.yaml, r.yaml));
      setDiffMode(true);
    }
  };

  const sorted = [...versions].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[var(--color-bench-surface)] border border-[var(--color-bench-border)] rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-bench-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-bench-text)] flex items-center gap-2">
            <Clock size={16} className="text-[var(--color-bench-accent)]" />
            {tq('Version History', '版本历史')}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {diffMode ? (
            <div className="p-4">
              <button onClick={() => setDiffMode(false)} className="flex items-center gap-1 text-xs text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] mb-3">
                <ArrowRight size={12} className="rotate-180" />
                {tq('Back to list', '返回列表')}
              </button>
              <div className="bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] rounded-lg overflow-hidden">
                <div className="font-mono text-xs leading-relaxed">
                  {diffResult.map((line, i) => (
                    <div
                      key={i}
                      className={`px-3 py-0.5 ${
                        line.type === 'add' ? 'bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)]' :
                        line.type === 'remove' ? 'bg-[var(--color-bench-error)]/10 text-[var(--color-bench-error)]' :
                        'text-[var(--color-bench-muted)]'
                      }`}
                    >
                      <span className="inline-block w-4 mr-2 text-[10px] opacity-50">
                        {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                      </span>
                      {line.text || ' '}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Compare mode selector */}
              <div className="flex items-center gap-2">
                <select
                  value={leftVer ?? ''}
                  onChange={(e) => setLeftVer(e.target.value ? Number(e.target.value) : null)}
                  className="px-2 py-1 bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] rounded text-xs text-[var(--color-bench-text)]"
                >
                  <option value="">{tq('Select version...', '选择版本...')}</option>
                  {sorted.map(v => <option key={v.version} value={v.version}>v{v.version} - {timeAgo(v.timestamp, t)}</option>)}
                </select>
                <GitCompare size={14} className="text-[var(--color-bench-muted)]" />
                <select
                  value={rightVer ?? ''}
                  onChange={(e) => setRightVer(e.target.value ? Number(e.target.value) : null)}
                  className="px-2 py-1 bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] rounded text-xs text-[var(--color-bench-text)]"
                >
                  <option value="">{tq('Select version...', '选择版本...')}</option>
                  {sorted.map(v => <option key={v.version} value={v.version}>v{v.version} - {timeAgo(v.timestamp, t)}</option>)}
                </select>
                <button
                  onClick={handleCompare}
                  disabled={leftVer === null || rightVer === null}
                  className="px-3 py-1 rounded text-xs bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {tq('Compare', '对比')}
                </button>
              </div>

              {/* Version list */}
              <div className="space-y-2">
                {sorted.map(v => (
                  <div
                    key={v.version}
                    className="flex items-center justify-between p-3 bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] rounded-lg hover:border-[var(--color-bench-accent)]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[var(--color-bench-accent)]/10 flex items-center justify-center text-xs font-bold text-[var(--color-bench-accent)]">
                        v{v.version}
                      </span>
                      <div>
                        <p className="text-xs text-[var(--color-bench-text)]">
                          {v.version === versions.length ? tq('Current', '当前版本') : tq(`Version ${v.version}`, `版本 ${v.version}`)}
                        </p>
                        <p className="text-[10px] text-[var(--color-bench-muted)]">{timeAgo(v.timestamp, t)}</p>
                      </div>
                    </div>
                    {v.version < versions.length && (
                      <button
                        onClick={() => handleRollback(v.version)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] text-[var(--color-bench-muted)] hover:text-[var(--color-bench-warn)] hover:bg-[var(--color-bench-warn)]/10 transition-colors"
                      >
                        <RotateCcw size={12} />
                        {tq('Rollback', '回滚')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}