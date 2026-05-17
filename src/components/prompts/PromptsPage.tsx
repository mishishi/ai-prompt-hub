import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Copy, Check, Clock, Sparkles, Eye, Search, X, Download, Upload, Globe, Code2 } from 'lucide-react';
import { getSavedPrompts, deletePrompt, savePrompt, generateId } from '../../utils/storage';
import type { Prompt } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';
import { parseEval } from '../../utils/parseEval';
import { parseSections } from '../../utils/parseSections';
import { useT } from '../../i18n/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { getDisplayName } from '../../utils/analytics';
import { PublishModal } from './PublishModal';

export function PromptsPage() {
  const navigate = useNavigate();
  const { lang } = useT();
  const { user } = useUser();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [publishTarget, setPublishTarget] = useState<Prompt | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [sourceViewId, setSourceViewId] = useState<string | null>(null);
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  useEffect(() => { setPrompts(getSavedPrompts()); }, []);

  const handleExport = () => {
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `prompts-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (Array.isArray(imported)) {
          imported.forEach((p: any) => {
            savePrompt({ ...p, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() });
          });
          setPrompts(getSavedPrompts());
        }
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = search.trim() ? prompts.filter(p => p.meta.name.toLowerCase().includes(search.toLowerCase()) || p.user.toLowerCase().includes(search.toLowerCase())) : prompts;

  const handleDelete = (id: string) => { deletePrompt(id); setPrompts(prev => prev.filter(p => p.id !== id)); };

  const handleCopy = async (e: React.MouseEvent, p: Prompt) => {
    e.stopPropagation();
    await copyToClipboard(p.user);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleDelete(id);
  };

  const handlePublished = () => { setPublishTarget(null); setPublishSuccess(true); setTimeout(() => setPublishSuccess(false), 3000); };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(lang === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-bench-accent)]/10 flex items-center justify-center"><FileText size={20} className="text-[var(--color-bench-accent)]" /></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{tq('My Prompts', '我的 Prompt')}</h2>
            <p className="text-sm text-[var(--color-bench-text-dim)]">{tq('Your saved and generated prompts', '你保存和生成的 Prompt')}</p>
          </div>
        </div>
        <button onClick={() => navigate('/generate')} className="btn-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"><Sparkles size={14} />{tq('New Prompt', '新建 Prompt')}</button>
        <div className="flex items-center gap-1">
          <button onClick={handleExport} disabled={prompts.length === 0} className="p-2 rounded-lg text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title={tq('Export', '导出')}><Download size={14} /></button>
          <label className="p-2 rounded-lg text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 transition-all cursor-pointer"><Upload size={14} /><input type="file" accept=".json" onChange={handleImport} className="hidden" /></label>
        </div>
      </div>

      {prompts.length > 0 && (
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bench-muted)]" />
          <input type="text" placeholder={tq("Search your prompts...", "搜索你的 Prompt...")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)] transition-colors" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] cursor-pointer"><X size={14} /></button>}
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4"><FileText size={24} className="text-[var(--color-bench-muted)]" /></div>
          <p className="text-sm text-[var(--color-bench-text-dim)] mb-1">{tq('No prompts yet', '还没有保存的 Prompt')}</p>
          <p className="text-sm text-[var(--color-bench-muted)] mb-6">{tq('Generate one with AI or save from templates', '用 AI 生成一个，或从模板库保存')}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/generate')} className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"><Sparkles size={14} />{tq('Generate Your First Prompt', '生成第一个 Prompt')}</button>
            <button onClick={() => navigate('/library')} className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium">{tq('Browse Templates', '浏览模板库')}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="glass-card group p-5 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--color-bench-text)] truncate font-[var(--font-display)]">{p.meta.name || tq('Untitled', '未命名')}</h3>
                    <Eye size={14} className="text-[var(--color-bench-muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-[var(--color-bench-text-dim)] line-clamp-2 mb-2">{p.user.slice(0, 200)}</p>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-bench-muted)]">
                    <span className="flex items-center gap-1"><Clock size={10} />{formatDate(p.updatedAt)}</span>
                    {p.source === 'generated' ? (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] text-xs font-medium">AI</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] text-xs font-medium">{tq('Template', '\u6A21\u677F')}</span>
                    )}
                      {p.evaluation && (() => {
                        const sc = parseEval(p.evaluation).score;
                        return sc !== null ? (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)] text-xs font-medium flex items-center gap-1">
                            <Sparkles size={10} />{sc}/100
                          </span>
                        ) : null;
                      })()}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => handleCopy(e, p)} className={"flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all " + (copiedId === p.id ? 'bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)]' : 'text-[var(--color-bench-text-dim)] hover:bg-[var(--color-bench-accent)]/10 hover:text-[var(--color-bench-accent)]')}>{copiedId === p.id ? <Check size={12} /> : <Copy size={12} />}{copiedId === p.id ? tq('Copied!', '已复制') : tq('Copy', '复制')}</button>
                  <button onClick={(e) => { e.stopPropagation(); setPublishTarget(p); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 transition-all"><Globe size={12} />{tq('Publish', '发布')}</button>
                  <button onClick={(e) => handleDeleteClick(e, p.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[var(--color-bench-text-dim)] hover:bg-[var(--color-bench-error)]/10 hover:text-[var(--color-bench-error)] transition-all"><Trash2 size={12} /></button>
                </div>
              </div>
              {expandedId === p.id && (
                <div className="mt-4 pt-4 border-t border-[var(--color-bench-border)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bench-muted)]">{tq('Full Preview', '完整预览')}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSourceViewId(sourceViewId === p.id ? null : p.id); }}
                      className={"flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all " + (sourceViewId === p.id ? "bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)]" : "text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)] hover:bg-white/5")}
                    >
                      <Code2 size={11} />
                      {sourceViewId === p.id ? tq('Text', '文本') : tq('Source', '源码')}
                    </button>
                  </div>
                                    {sourceViewId !== p.id ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {/* AI-generated: parse markdown sections from user text */}
                      {(!p.system?.role && p.source === 'generated') ? (
                        parseSections(p.user).map((sec, i) => (
                          <div key={i} className="rounded-lg border overflow-hidden" style={{ borderColor: sec.color + '33' }}>
                            <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ backgroundColor: sec.color + '14' }}>
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                              <span className="text-xs font-semibold" style={{ color: sec.color }}>{sec.title}</span>
                            </div>
                            <div className="px-3 py-2 bg-[var(--color-bench-bg)]">
                              <pre className="text-xs text-[var(--color-bench-text-dim)] leading-relaxed whitespace-pre-wrap font-mono">{sec.content}</pre>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                      {p.system?.role && (
                        <div className="bg-[var(--color-bench-bg)] border border-[#3b82f6]/20 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /><span className="text-xs font-semibold text-[#3b82f6]">Role</span></div>
                          <p className="text-xs text-[var(--color-bench-text-dim)]">{lang === 'zh-CN' && p.system.roleZh ? p.system.roleZh : p.system.role}</p>
                        </div>
                      )}
                      {(p.system?.rules?.length ?? 0) > 0 && (
                        <div className="bg-[var(--color-bench-bg)] border border-[#f59e0b]/20 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /><span className="text-xs font-semibold text-[#f59e0b]">Rules</span></div>
                          <ul className="space-y-0.5">{(lang === 'zh-CN' && p.system.rulesZh?.length ? p.system.rulesZh : p.system.rules)?.map((r, i) => <li key={i} className="text-xs text-[var(--color-bench-text-dim)]">{i + 1}. {r}</li>)}</ul>
                        </div>
                      )}
                      <div className="bg-[var(--color-bench-bg)] border border-[#a855f7]/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" /><span className="text-xs font-semibold text-[#a855f7]">Prompt</span></div>
                        <pre className="text-xs text-[var(--color-bench-text-dim)] leading-relaxed whitespace-pre-wrap font-mono">{lang === 'zh-CN' && p.userZh ? p.userZh : p.user}</pre>
                      </div>
                      {(p.variables?.length ?? 0) > 0 && (
                        <div className="bg-[var(--color-bench-bg)] border border-[#22c55e]/20 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /><span className="text-xs font-semibold text-[#22c55e]">Variables</span></div>
                          <div className="space-y-0.5">{p.variables.map((v, i) => <div key={i} className="text-xs text-[var(--color-bench-text-dim)]"><span className="text-[#22c55e] font-mono">{'{{'}{v.name}{'}}'}</span> {lang === 'zh-CN' && v.labelZh ? v.labelZh : v.label} = {String(v.default ?? tq('(none)', '(无)'))}</div>)}</div>
                        </div>
                      )}
                      {p.output_schema && (
                        <div className="bg-[var(--color-bench-bg)] border border-[#6b7280]/20 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-[#6b7280]" /><span className="text-xs font-semibold text-[#6b7280]">Output Schema</span></div>
                          <pre className="text-xs text-[var(--color-bench-text-dim)] font-mono">{typeof p.output_schema === 'string' ? p.output_schema : JSON.stringify(p.output_schema, null, 2)}</pre>
                        </div>
                      )}
                        </>
                      )}
                    </div>
                  ) : (
                    <pre className="text-xs text-[var(--color-bench-text)] leading-relaxed whitespace-pre-wrap font-mono bg-[var(--color-bench-bg)] rounded-lg p-4 max-h-64 overflow-y-auto">{p.user}</pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {publishSuccess && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[var(--color-bench-success)]/15 border border-[var(--color-bench-success)]/30 text-sm text-[var(--color-bench-success)] shadow-lg">{tq('Published to community!', '已发布到社区！')}</div>
      )}
      {publishTarget && user && (
        <PublishModal prompt={publishTarget} authorId={user.id} authorName={getDisplayName(user)} onClose={() => setPublishTarget(null)} onPublished={handlePublished} />
      )}
    </div>
  );
}
