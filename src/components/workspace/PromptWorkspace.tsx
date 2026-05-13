import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Copy, Check, Edit3, Sparkles, FileText, GitFork } from 'lucide-react';
import { getAllPrompts, deletePrompt } from '../../store/myTemplates';
import { renderPrompt } from '../../utils/yaml';
import { copyToClipboard } from '../../utils/clipboard';
import { useT } from '../../i18n/LanguageContext';
import type { Prompt } from '../../types';

function relativeTime(ts: number, tq: (en: string, zh: string) => string): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return tq('Just now', '刚刚');
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function PromptWorkspace() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { setPrompts(getAllPrompts()); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearch(''); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  const filtered = prompts.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.meta.name.toLowerCase().includes(q) ||
      p.meta.description.toLowerCase().includes(q) ||
      p.meta.tags.some(tag => tag.toLowerCase().includes(q));
  });

  const handleDelete = (id: string) => {
    deletePrompt(id);
    setPrompts(getAllPrompts());
  };

  const handleCopy = async (p: Prompt) => {
    const text = renderPrompt(p, {}, lang);
    await copyToClipboard(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  return (
    <div className="flex-1 flex flex-col page-enter overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-bench-text)] flex items-center gap-2">
              <FileText size={20} className="text-[var(--color-bench-accent)]" />
              {tq('My Prompts', '我的 Prompts')}
            </h2>
            <p className="text-sm text-[var(--color-bench-muted)] mt-1">
              {prompts.length === 0
                ? tq('No prompts yet. Generate one or fork a template.', '暂无 Prompt。去生成一个或 Fork 模板吧。')
                : tq(`${prompts.length} prompts`, `${prompts.length} 个 Prompt`)
              }
            </p>
          </div>
          <button
            onClick={() => navigate('/generate')}
            className="btn-glow flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            <Sparkles size={14} />
            {tq('New', '新建')}
          </button>
        </div>

        {prompts.length > 0 && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bench-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tq('Search prompts...', '搜索 Prompt...')}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)] transition-colors"
            />
          </div>
        )}

        {prompts.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] flex items-center justify-center mx-auto bg-[var(--color-bench-elevated)]">
              <FileText size={28} className="text-[var(--color-bench-muted)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-bench-text)]">{tq('Your prompt library is empty', '你的 Prompt 库还是空的')}</p>
              <p className="text-sm text-[var(--color-bench-muted)] mt-1">
                {tq('Start by generating one with AI or forking a template', '用 AI 生成一个，或者从模板库 Fork 一个')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/generate')} className="px-4 py-2 rounded-lg bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] text-sm font-medium hover:brightness-110 transition-colors">
                {tq('AI Generate', 'AI 生成')}
              </button>
              <button onClick={() => navigate('/library')} className="px-4 py-2 rounded-lg bg-[var(--color-bench-surface)] border border-[var(--color-bench-border)] text-[var(--color-bench-text)] text-sm font-medium hover:bg-white/5 transition-colors">
                {tq('Browse Templates', '浏览模板')}
              </button>
            </div>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(p => (
              <div
                key={p.id}
                className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg p-4 hover:border-[var(--color-bench-accent)]/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-bench-accent)]/0 group-hover:bg-[var(--color-bench-accent)]/30 transition-colors rounded-l-lg" />
                <div className="flex items-start justify-between gap-3 pl-0.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--color-bench-text)] truncate">
                        {p.meta.name || tq('Untitled', '未命名')}
                      </h3>
                      {p.source === 'generated' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[11px] font-medium bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)]">
                          <Sparkles size={11} className="inline mr-0.5" />AI
                        </span>
                      )}
                      {p.source === 'forked' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[11px] font-medium bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)]">
                          <GitFork size={11} className="inline mr-0.5" />Fork
                        </span>
                      )}
                    </div>
                    {p.meta.description && (
                      <p className="text-xs text-[var(--color-bench-muted)] mt-1 line-clamp-2">{p.meta.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[var(--color-bench-muted)]">{relativeTime(p.updatedAt, tq)}</span>
                      {p.meta.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {p.meta.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded text-[11px] bg-[var(--color-bench-bg)] text-[var(--color-bench-muted)]">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 transition-opacity shrink-0 opacity-60 hover:opacity-100">
                    <button onClick={() => handleCopy(p)} className="p-2 rounded-md text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] hover:bg-white/5 transition-colors" title={tq('Copy', '复制')}>
                      {copiedId === p.id ? <Check size={15} className="text-[var(--color-bench-success)]" /> : <Copy size={15} />}
                    </button>
                    <button onClick={() => handleEdit(p.id)} className="p-2 rounded-md text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] hover:bg-white/5 transition-colors" title={tq('Edit', '编辑')}>
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-md text-[var(--color-bench-muted)] hover:text-[var(--color-bench-error)] hover:bg-[var(--color-bench-error)]/10 transition-colors" title={tq('Delete', '删除')}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {prompts.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--color-bench-muted)]">{tq('No prompts match your search', '没有匹配的 Prompt')}</p>
          </div>
        )}
      </div>
    </div>
  );
}