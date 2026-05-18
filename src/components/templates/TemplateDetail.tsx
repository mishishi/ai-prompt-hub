import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Sparkles, ChevronLeftIcon, Save, Link2, ThumbsUp, ThumbsDown, FileText, X, Lightbulb, ListChecks, AlertCircle, Code2 } from 'lucide-react';
import { templates } from '../../data/templates';
import type { LibraryTemplate } from '../../types';
import { tName, tShort, tTips, tLabel, tOptions } from '../../data/templates/helper';
import { renderPrompt } from '../../utils/renderer';
import { parseSections } from '../../utils/parseSections';
import { copyToClipboard } from '../../utils/clipboard';
import { track, getDisplayName } from '../../utils/analytics';
import { useT } from '../../i18n/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '../ui/Toast';
import { CommentsSection } from './CommentsSection';
import { addRecentView } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';
export function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const toast = useToast();
  const { user } = useUser();
  const localTemplate = templates.find((tmpl) => tmpl.id === id);

  // Community template — fetch from API when not found locally
  const [communityTemplate, setCommunityTemplate] = useState<LibraryTemplate | null>(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const effectiveLoading = communityLoading && !localTemplate;
  useEffect(() => {
    if (localTemplate || communityTemplate) return;
    fetch('/api/community/' + id)
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.template) {
          setCommunityTemplate({
            _community: true,
            _verified: data.template.verified ?? 0,
            id: data.template.id,
            meta: {
              name: data.template.name,
              nameZh: data.template.name,
              description: data.template.description || '',
              descriptionZh: data.template.description || '',
              tags: data.template.tags || [],
              platform: 'claude' as const,
            },
            variables: [],
            system: { role: '' },
            user: data.template.prompt,
            category: [data.template.category],
            difficulty: data.template.difficulty || 'Beginner',
          } as LibraryTemplate);
        }
      })
      .catch(() => {})
      .finally(() => setCommunityLoading(false));
  }, [id, localTemplate, communityTemplate]);

  const template = localTemplate || communityTemplate;
  const tipsText = template ? tTips(template, lang) : '';
  const hasExpected = !!(template?.expectedOutput || (template?.expectedDeliverables?.length ?? 0) > 0);
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>({});
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [antiOpen, setAntiOpen] = useState(false);
  const [sourceView, setSourceView] = useState(true);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [ready, setReady] = useState(false);
  const [saveTicker, setSaveTicker] = useState(0);
  const [mobileTab, setMobileTab] = useState<'params' | 'preview'>('params');
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (popoverOpen) { setPopoverOpen(false); } else { navigate('/library'); } } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, popoverOpen]);
  useEffect(() => {
    if (!template) return;
    const name = tName(template, lang);
    const desc = tShort(template, lang);
    document.title = name + ' — PromptBench';
    const setMeta = (attr: string, val: string, isProp: boolean) => {
      const sel = isProp ? 'meta[property="' + attr + '"]' : 'meta[name="' + attr + '"]';
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); if (isProp) { el.setAttribute('property', attr); } else { el.setAttribute('name', attr); } document.head.appendChild(el); }
      el.content = val;
    };
    setMeta('description', desc, false);
    setMeta('og:title', name + ' — PromptBench', true);
    setMeta('og:description', desc, true);
    setMeta('og:url', window.location.href, true);
    return () => { document.title = 'PromptBench — Structured Prompt Engineering'; };
  }, [template, lang]);
  useEffect(() => {
    if (template) {
      track({ type: 'template_view', templateId: template.id, lang, userId: user?.id, userName: getDisplayName(user), provider: user?.externalAccounts?.[0]?.provider });
      addRecentView(template.id);
      const defaults: Record<string, string | boolean | string[]> = {};
      template.variables.forEach((v) => { if (v.default !== undefined) defaults[v.name] = v.default; });
      requestAnimationFrame(() => {
        setValues(defaults);
        setReady(true);
      });
    }
  }, [template, saveTicker]);
  const rendered = useMemo(() => {
    if (!template) return '';
    return renderPrompt(template, lang, values);
  }, [template, lang, values]);
  const sourceContent = !template ? null : (template as any)._community
    ? (<>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-280px)]">
                      {parseSections(template.user).map((sec, i: number) => (
                        <div key={i} className="bg-[var(--color-bench-bg)] border rounded-xl p-4" style={{ borderColor: sec.color + '33' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                            <span className="text-sm font-semibold" style={{ color: sec.color }}>{sec.title}</span>
                          </div>
                          <pre className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed whitespace-pre-wrap font-mono">{sec.content}</pre>
                        </div>
                      ))}
                    </div>
      </>)
    : (<>

                  <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-280px)]">
                  {/* Role */}
                  <div className="bg-[var(--color-bench-bg)] border border-[#3b82f6]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                      <span className="text-sm font-semibold text-[#3b82f6]">{tq('Role', '角色')} (system.role)</span>
                    </div>
                    <p className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed">{lang === 'zh-CN' && template?.system?.roleZh ? template.system.roleZh : template?.system?.role || tq('(not set)', '(未设置)')}</p>
                  </div>
                  {(template?.system?.rules?.length ?? 0) > 0 && (
                  <div className="bg-[var(--color-bench-bg)] border border-[#f59e0b]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                      <span className="text-sm font-semibold text-[#f59e0b]">{tq('Rules', '规则')} (system.rules)</span>
                    </div>
                    <ul className="space-y-1">
                      {((lang === "zh-CN" && (template?.system?.rulesZh?.length ?? 0) > 0 ? template.system.rulesZh : template?.system?.rules) || []).map((rule: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-bench-text-dim)]">
                          <span className="text-[#f59e0b] text-xs mt-0.5">{i + 1}.</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  )}
                  <div className="bg-[var(--color-bench-bg)] border border-[#a855f7]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
                      <span className="text-sm font-semibold text-[#a855f7]">{tq('User Prompt', '用户模板')} (user)</span>
                    </div>
                    <pre className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed whitespace-pre-wrap font-mono">{lang === 'zh-CN' ? (template?.userZh || template?.user) : (template?.user || template?.userZh) || ''}</pre>
                  </div>
                  {(template?.variables?.length ?? 0) > 0 && (
                  <div className="bg-[var(--color-bench-bg)] border border-[#22c55e]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      <span className="text-sm font-semibold text-[#22c55e]">{tq('Variables', '变量')} (variables)</span>
                    </div>
                    <div className="space-y-1.5">
                      {template.variables.map((v, i: number) => {
                        const val = values[v.name];
                        const label = (lang === 'zh-CN' ? v.labelZh : v.label) || v.name;
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-[#22c55e] font-mono text-sm">{'{{'}{v.name}{'}}'}</span>
                            <span className="text-[var(--color-bench-muted)]">{label}</span>
                            <span className="text-[var(--color-bench-text-dim)]">{'='} {val !== undefined ? (typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val)) : tq('(not filled)', '(未填)')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  )}
                  {template?.output_schema && (
                  <div className="bg-[var(--color-bench-bg)] border border-[#6b7280]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#6b7280]" />
                      <span className="text-sm font-semibold text-[#6b7280]">{tq('Output Schema', '输出格式')} (output_schema)</span>
                    </div>
                    <pre className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed whitespace-pre-wrap font-mono">{typeof template.output_schema === 'string' ? template.output_schema : JSON.stringify(template.output_schema, null, 2)}</pre>
                  </div>
                  )}
                </div>
      </>);



    
  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.show(tq("Link copied!", "链接已复制！"));
    } catch {
      // fallback
    }
  };


  const handleSave = () => {
    try {
      const key = STORAGE_KEYS.savedTemplates;
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = arr.findIndex((s: { id: string }) => s.id === template?.id);
      if (idx >= 0) {
        arr.splice(idx, 1);
        setSaveTicker(t => t + 1);
        toast.show(tq("Removed from My Prompts", "已从我的 Prompt 移除"));
      } else {
        arr.push({
          id: template?.id,
          name: template ? tName(template, lang) : '',
          prompt: template?.user || '',
          savedAt: Date.now(),
        });
        setSaveTicker(t => t + 1);
        toast.show(tq("Saved to My Prompts", "已保存到我的 Prompt"));
      }
      localStorage.setItem(key, JSON.stringify(arr));
    } catch { toast.show(tq('Save failed', '保存失败'), 'error'); }
  };

  const saved = useMemo(() => {
    if (!template) return false;
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEYS.savedTemplates) || '[]');
    return arr.some((s: { id: string }) => s.id === template.id);
  }, [template]);
const handleFeedback = async (value: 'up' | 'down') => {
    setFeedback(value);
    track({ type: 'ai_feedback', templateId: template!.id, lang, userId: user?.id, userName: getDisplayName(user), provider: user?.externalAccounts?.[0]?.provider });
    if (template?._community && user?.id) {
      try {
        const res = await fetch('/api/community/' + template.id + '/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, value }),
        });
        const data = await res.json();
        if (!data.ok) console.warn('feedback failed')
      } catch { toast.show(tq('Feedback failed', '反馈提交失败'), 'error'); }
    } else {
      const fb = JSON.parse(localStorage.getItem(STORAGE_KEYS.templateFeedback) || '[]');
      const existing = fb.findIndex((f: { id: string; value?: string; ts?: number }) => f.id === template!.id);
      if (existing >= 0) fb[existing].value = value;
      else fb.push({ id: template!.id, value, ts: Date.now() });
      localStorage.setItem(STORAGE_KEYS.templateFeedback, JSON.stringify(fb));
    }
  };

const handleCopy = async () => {
    track({ type: 'template_copy', templateId: template!.id, lang, userId: user?.id, userName: getDisplayName(user), provider: user?.externalAccounts?.[0]?.provider });
    await copyToClipboard(rendered);
    setCopied(true);
    setFlash(true);
    setTimeout(() => { setCopied(false); setFlash(false); }, 2000);
  };
  if (effectiveLoading) {
    return (
      <div className="flex flex-col lg:flex-row h-full">
        <div className="w-full lg:w-80 lg:border-r border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] p-4 md:p-5 space-y-4">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-4 md:px-5 py-3 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)]">
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="flex-1 p-4 md:p-6">
            <div className="skeleton w-full h-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  if (!template) {
    return <div className="flex items-center justify-center h-full text-[var(--color-bench-muted)]">{t('detail.notFound')}</div>;
  }
  if (!ready) {
    return (
      <div className="flex flex-col lg:flex-row h-full">
        <div className="w-full lg:w-80 lg:border-r border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] p-4 md:p-5 space-y-4">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-64" />
          <div className="flex gap-2"><div className="skeleton h-5 w-16" /><div className="skeleton h-5 w-12" /></div>
          <div className="pt-4 space-y-3">
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-4 md:px-5 py-3 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)]">
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="flex-1 p-4 md:p-6">
            <div className="skeleton w-full h-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
    <div className="flex flex-col lg:flex-row h-full page-enter">
      {/* Mobile tab switcher */}
      <div className="flex lg:hidden border-b border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] shrink-0">
        <button onClick={() => setMobileTab('params')} className={"flex-1 py-2.5 text-xs font-semibold text-center transition-all " + (mobileTab === 'params' ? "text-[var(--color-bench-accent)] border-b-2 border-[var(--color-bench-accent)]" : "text-[var(--color-bench-muted)] border-b-2 border-transparent")}>{tq('Parameters', '参数设置')}</button>
        <button onClick={() => setMobileTab('preview')} className={"flex-1 py-2.5 text-xs font-semibold text-center transition-all " + (mobileTab === 'preview' ? "text-[var(--color-bench-accent)] border-b-2 border-[var(--color-bench-accent)]" : "text-[var(--color-bench-muted)] border-b-2 border-transparent")}>{tq('Preview', '预览')}</button>
      </div>
      {/* Left panel */}
      <div className={"w-full lg:w-80 lg:border-r border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] overflow-y-auto flex flex-col lg:max-h-full max-h-[50vh] lg:max-h-full border-b lg:border-b-0 " + (mobileTab === 'params' ? "flex" : "hidden") + " lg:flex"}>
        <div className="p-4 md:p-5 border-b border-[var(--color-bench-border)]">
          <button onClick={() => navigate('/library')} className="flex items-center gap-1.5 text-xs text-[var(--color-bench-muted)] hover:text-[var(--color-bench-accent)] transition-colors mb-3">
            <ChevronLeftIcon size={12} className="" />
            {t('detail.back')}
          </button>
          <h2 className="text-lg font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{tName(template, lang)}{(template as LibraryTemplate & { _authorName?: string })._authorName && (<span className="text-sm text-[var(--color-bench-muted)] ml-3">by {(template as LibraryTemplate & { _authorName?: string })._authorName}</span>)}</h2>
          <p className="text-sm text-[var(--color-bench-text-dim)] mt-1.5 leading-relaxed">{tShort(template, lang)}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {template.meta.tags.slice(0, 4).map((tag) => (<span key={tag} onClick={(e) => { e.stopPropagation(); navigate(`/library?search=${encodeURIComponent(tag)}`); }} className="text-xs px-2 py-1 rounded-md bg-white/5 text-[var(--color-bench-muted)] hover:text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 cursor-pointer transition-colors">{(() => { const translated = t(`tag.${tag}`); return translated === `tag.${tag}` ? tag : translated; })()}</span>))}
          </div>
        </div>
        {template.variables.length > 0 && (
          <div className="p-4 md:p-5 border-b border-[var(--color-bench-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bench-muted)]">{t('detail.variables')}</h3>
              <span className="text-xs text-[var(--color-bench-muted)]/60">
                {(() => { const req = template.variables.filter(v => v.required).length; return tq(template.variables.length + ' vars, ' + req + ' required', template.variables.length + ' 个变量，' + req + ' 个必填'); })()}
              </span>
            </div>
            <div className="space-y-3">
              {template.variables.map((v) => {
                const label = tLabel(v, lang);
                const options = tOptions(v, lang);
                const val = values[v.name];
                return (
                  <div key={v.name} className={v.required ? 'p-2.5 -mx-2 rounded-lg bg-[var(--color-bench-accent)]/5 border border-[var(--color-bench-accent)]/10' : ''}>
                    <label className="block text-xs font-medium text-[var(--color-bench-text)] mb-1 flex items-center gap-2">
                      {label}
                      {v.required ? <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-[var(--color-bench-error)]/10 text-[var(--color-bench-error)] uppercase">{t('detail.required_badge')}</span> : <span className="text-xs px-1.5 py-0.5 rounded text-[var(--color-bench-muted)]/50 uppercase">{t('detail.optional_badge')}</span>}
                    </label>
                    {v.type === 'enum' && options.length > 0 ? (
                      <select value={String(val ?? v.default ?? '')} onChange={(e) => setValues({ ...values, [v.name]: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-xs text-[var(--color-bench-text)]">
                        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    ) : v.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={Boolean(val ?? v.default ?? false)} onChange={(e) => setValues({ ...values, [v.name]: e.target.checked })} className="rounded accent-[var(--color-bench-accent)]" />
                        <span className="text-xs text-[var(--color-bench-muted)]">{val ? t('detail.enabled') : t('detail.disabled')}</span>
                      </label>
                    ) : (
                      <input type="text" value={String(val ?? '')} onChange={(e) => setValues({ ...values, [v.name]: e.target.value })} placeholder={v.required ? t('detail.required_placeholder') : t('detail.optional')} className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-xs text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)]/50 focus:outline-none focus:border-[var(--color-bench-accent)]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {(template.system?.role || ((template.system?.rules?.length ?? 0) > 0)) && (
          <div className="border-b border-[var(--color-bench-border)] px-5 py-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bench-muted)] mb-2">{tq('System', '系统设定')}</h3>
            {template.system?.role && <p className="text-sm text-[var(--color-bench-accent)] mb-2">{lang === 'zh-CN' && template.system.roleZh ? template.system.roleZh : template.system.role}</p>}
            {((lang === 'zh-CN' && (template.system?.rulesZh?.length ?? 0) > 0 ? template.system.rulesZh : template.system?.rules) || []).map((rule: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-bench-muted)] mb-1">
                <span className="text-[var(--color-bench-accent)] mt-0.5">•</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        )}
        {tipsText && (
          <div className="px-4 md:px-5 py-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bench-muted)] mb-2 flex items-center gap-1">
              <Sparkles size={12} />{t('detail.tips')}
            </h3>
            <p className="text-sm text-[var(--color-bench-muted)] leading-relaxed">{tipsText}</p>
          </div>
        )}
      </div>
      {/* Right panel: preview */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="px-4 md:px-5 py-3 border-b border-[var(--color-bench-border)] flex items-center justify-between bg-[var(--color-bench-elevated)]">
          <span className="text-sm uppercase tracking-wider text-[var(--color-bench-muted)]">{tq('Prompt Output', 'Prompt 输出')}</span>
          <button
            onClick={() => setSourceView(!sourceView)}
            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all " + (sourceView ? "bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)]" : "text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)] hover:bg-white/5")}
            title={sourceView ? tq('Show rendered output', '显示渲染结果') : tq('Show source view', '显示源码视图')}
          >
            <Code2 size={12} />
            {sourceView ? tq('Rendered', '渲染') : tq('Source', '源码')}
          </button>
          
          <button onClick={handleCopy} className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (copied ? 'bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]' : 'bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] hover:brightness-110')}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('detail.copied') : t('detail.copy')}
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 transition-all"><Link2 size={14} />{tq("Share", "分享")}</button>
          <button onClick={handleSave} className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all " + (saved ? "bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]" : "bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20")}><Save size={14} />{t(saved ? "detail.saved" : "detail.save")}</button>
        </div>


        {/* Action bar: Examples | Checklist | Expected Output */}
        <div className="px-4 md:px-5 py-3 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)]/50 flex items-center justify-center gap-3">
          {hasExpected && (
            <button
              onClick={() => setPopoverOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:border-[var(--color-bench-accent)]/30 hover:bg-[var(--color-bench-accent)]/5 transition-all"
            >
              <FileText size={14} />
              {tq('Expected Output', '预期产出')}
            </button>
          )}
          {(template?.examples || template?.examplesZh) && (
            <button
              onClick={() => setExamplesOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:border-[var(--color-bench-accent)]/30 hover:bg-[var(--color-bench-accent)]/5 transition-all"
            >
              <Lightbulb size={14} />
              {tq('Examples', '示例')}
            </button>
          )}
          {(template?.contextChecklist?.length || template?.contextChecklistZh?.length) ? (
            <button
              onClick={() => setChecklistOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-success)] hover:border-[var(--color-bench-success)]/30 hover:bg-[var(--color-bench-success)]/5 transition-all"
            >
              <ListChecks size={14} />
              {tq('Checklist', '准备清单')}
            </button>
          ) : null}
          {(template?.antiPatterns?.length || template?.antiPatternsZh?.length) ? (
            <button
              onClick={() => setAntiOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-error)] hover:border-[var(--color-bench-error)]/30 hover:bg-[var(--color-bench-error)]/5 transition-all"
            >
              <AlertCircle size={14} />
              {tq('Anti-Patterns', '反面模式')}
            </button>
          ) : null}
        </div>
        {/* Popovers */}
        {popoverOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPopoverOpen(false)}>
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
            <div className="relative w-full max-w-md bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-bench-border)]">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-[var(--color-bench-accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('Expected Output', '预期产出')}</h3>
                </div>
                <button onClick={() => setPopoverOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X size={16} className="text-[var(--color-bench-muted)]" /></button>
              </div>
              <div className="p-5 max-h-96 overflow-y-auto text-sm text-[var(--color-bench-text-dim)] leading-relaxed">
                {template?.expectedOutput && <p className="mb-4">{lang === "zh-CN" ? (template?.expectedOutputZh || template?.expectedOutput) : template.expectedOutput}</p>}
                {(template?.expectedDeliverables?.length || template?.expectedDeliverablesZh?.length) ? (
                  <div>
                    <p className="text-sm font-medium text-[var(--color-bench-text)] mb-2">{tq("Deliverables", "交付物")}</p>
                    <ul className="space-y-1.5">{((lang === "zh-CN" ? (template?.expectedDeliverablesZh || template?.expectedDeliverables) : (template?.expectedDeliverables || template?.expectedDeliverablesZh)) || []).map((item: string, i: number) => <li key={i} className="flex items-start gap-2">{'•'} {item}</li>)}</ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
        {examplesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setExamplesOpen(false)}>
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
            <div className="relative w-full max-w-md bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-bench-border)]">
                <div className="flex items-center gap-2.5"><Lightbulb size={16} className="text-[var(--color-bench-accent)]" /><h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('Examples', '示例')}</h3></div>
                <button onClick={() => setExamplesOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X size={16} className="text-[var(--color-bench-muted)]" /></button>
              </div>
              <div className="p-5 max-h-96 overflow-y-auto"><pre className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed whitespace-pre-wrap font-mono">{lang === 'zh-CN' ? (template?.examplesZh || template?.examples) : (template?.examples || template?.examplesZh) || ''}</pre></div>
            </div>
          </div>
        )}
        {checklistOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setChecklistOpen(false)}>
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
            <div className="relative w-full max-w-md bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-bench-border)]">
                <div className="flex items-center gap-2.5"><ListChecks size={16} className="text-[var(--color-bench-success)]" /><h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('Context Checklist', '使用前准备')}</h3></div>
                <button onClick={() => setChecklistOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X size={16} className="text-[var(--color-bench-muted)]" /></button>
              </div>
              <div className="p-5 max-h-96 overflow-y-auto">
                {(() => { const items = lang === 'zh-CN' ? (template?.contextChecklistZh || template?.contextChecklist) : (template?.contextChecklist || template?.contextChecklistZh); return (<ul className="space-y-2">{(items || []).map((item: string, i: number) => (<li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-bench-text-dim)]"><span className="text-[var(--color-bench-success)] mt-0.5 flex-shrink-0">{'☑'}</span>{item}</li>))}</ul>); })()}
              </div>
            </div>
          </div>
        )}
        {antiOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setAntiOpen(false)}>
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
            <div className="relative w-full max-w-md bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-bench-border)]">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-[var(--color-bench-error)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('Anti-Patterns', '反面模式')}</h3>
                </div>
                <button onClick={() => setAntiOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X size={16} className="text-[var(--color-bench-muted)]" /></button>
              </div>
              <div className="p-5 max-h-96 overflow-y-auto">
                <p className="text-sm text-[var(--color-bench-muted)] mb-3">{tq('Things to avoid when using this prompt:', '使用此 Prompt 时应避免：')}</p>
                {(() => { const items = lang === 'zh-CN' ? (template?.antiPatternsZh || template?.antiPatterns) : (template?.antiPatterns || template?.antiPatternsZh); return (<ul className="space-y-2">{(items || []).map((item: string, i: number) => (<li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-bench-text-dim)]"><span className="text-[var(--color-bench-error)] mt-0.5 flex-shrink-0">{'✗'}</span>{item}</li>))}</ul>); })()}
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--color-bench-bg)]">
          <div className={'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden shadow-lg ' + (flash ? 'preview-flash' : '')}>
            <div className="px-4 md:px-5 py-3 border-b border-[var(--color-bench-border)] flex items-center gap-3 bg-[var(--color-bench-surface-solid)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]/20" />
              </div>
              <span className="text-xs text-[var(--color-bench-muted)] uppercase tracking-wider">{t('detail.preview')}</span>
            </div>
            <div className="p-4 md:p-6">
              {sourceView ? sourceContent : (

                              <pre className="prompt-preview overflow-x-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-280px)]">{rendered || <span className="text-[var(--color-bench-muted)] italic">{t('detail.setValues')}</span>}</pre>
              )}            </div>
          </div>

          

          {/* Comments Section */}
          {template?._community && (
            <div className="mt-8 border-t border-[var(--color-bench-border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--color-bench-text)] mb-4">{tq('Comments', '评论')}</h3>
              <CommentsSection templateId={template.id} />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 px-1">
            <span className="text-xs text-[var(--color-bench-muted)]">{tq('Was this helpful?', '这个模板有用吗？')}</span>
            <button onClick={() => handleFeedback('up')} className={`p-1.5 rounded transition-colors cursor-pointer ${feedback === 'up' ? 'text-[var(--color-bench-success)] bg-[var(--color-bench-success)]/10' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-success)] hover:bg-[var(--color-bench-success)]/5'}`}><ThumbsUp size={14} /></button>
            <button onClick={() => handleFeedback('down')} className={`p-1.5 rounded transition-colors cursor-pointer ${feedback === 'down' ? 'text-[var(--color-bench-error)] bg-[var(--color-bench-error)]/10' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-error)] hover:bg-[var(--color-bench-error)]/5'}`}><ThumbsDown size={14} /></button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
