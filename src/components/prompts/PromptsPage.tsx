import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Copy, Check, Clock, Sparkles } from 'lucide-react';
import { getSavedPrompts, deletePrompt } from '../../utils/storage';
import type { Prompt } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';
import { useT } from '../../i18n/LanguageContext';

export function PromptsPage() {
  const navigate = useNavigate();
  const { lang } = useT();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  useEffect(() => { setPrompts(getSavedPrompts()); }, []);

  const handleDelete = (id: string) => { deletePrompt(id); setPrompts(prev => prev.filter(p => p.id !== id)); };

  const handleCopy = async (p: Prompt) => { await copyToClipboard(p.user); setCopiedId(p.id); setTimeout(() => setCopiedId(null), 2000); };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(lang === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-bench-accent)]/10 flex items-center justify-center"><FileText size={20} className="text-[var(--color-bench-accent)]" /></div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{tq('My Prompts', '我的 Prompt')}</h2>
            <p className="text-sm text-[var(--color-bench-text-dim)]">{tq('Your saved and generated prompts', '你保存和生成的 Prompt')}</p>
          </div>
        </div>
        <button onClick={() => navigate('/generate')} className="btn-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"><Sparkles size={14} />{tq('New Prompt', '新建 Prompt')}</button>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4"><FileText size={24} className="text-[var(--color-bench-muted)]" /></div>
          <p className="text-base text-[var(--color-bench-text-dim)] mb-1">{tq('No prompts yet', '还没有保存的 Prompt')}</p>
          <p className="text-sm text-[var(--color-bench-muted)] mb-6">{tq('Generate one with AI or save from templates', '用 AI 生成一个，或从模板库保存')}</p>
          <button onClick={() => navigate('/generate')} className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"><Sparkles size={14} />{tq('Generate Your First Prompt', '生成第一个 Prompt')}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((p) => (
            <div key={p.id} className="glass-card group p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)] mb-1 truncate font-[var(--font-display)]">{p.meta.name || tq('Untitled', '未命名')}</h3>
                <p className="text-xs text-[var(--color-bench-text-dim)] line-clamp-2 mb-2">{p.user.slice(0, 200)}</p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-bench-muted)]">
                  <span className="flex items-center gap-1"><Clock size={10} />{formatDate(p.updatedAt)}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)]">{p.source === 'generated' ? 'AI' : tq('Template', '模板')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleCopy(p)} className={"flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all " + (copiedId === p.id ? 'bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)]' : 'text-[var(--color-bench-text-dim)] hover:bg-[var(--color-bench-accent)]/10 hover:text-[var(--color-bench-accent)]')}>{copiedId === p.id ? <Check size={12} /> : <Copy size={12} />}{copiedId === p.id ? tq('Copied!', '已复制') : tq('Copy', '复制')}</button>
                <button onClick={() => handleDelete(p.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-bench-text-dim)] hover:bg-[var(--color-bench-error)]/10 hover:text-[var(--color-bench-error)] transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}