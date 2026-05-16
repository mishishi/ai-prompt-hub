import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Sparkles, ChevronLeftIcon, Save, Link2 } from 'lucide-react';
import { templates } from '../../data/templates';
import { tName, tShort, tTips, tLabel, tOptions } from '../../data/templates/helper';
import { renderPrompt } from '../../utils/renderer';
import { copyToClipboard } from '../../utils/clipboard';
import { track } from '../../utils/analytics';
import { useT } from '../../i18n/LanguageContext';
import { useToast } from '../ui/Toast';
import { savePrompt, generateId, addRecentView } from '../../utils/storage';
import type { Prompt } from '../../types';
export function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const toast = useToast();
  const template = templates.find((tmpl) => tmpl.id === id);
  const tipsText = template ? tTips(template, lang) : '';
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>({});
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobileTab, setMobileTab] = useState<'params' | 'preview'>('params');
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/library'); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
  useEffect(() => {
    if (template) {
      track({ type: 'template_view', templateId: template.id, lang });
      addRecentView(template.id);
      const defaults: Record<string, string | boolean | string[]> = {};
      template.variables.forEach((v) => { if (v.default !== undefined) defaults[v.name] = v.default; });
      setValues(defaults);
      setReady(true);
    }
  }, [template]);
  const rendered = useMemo(() => {
    if (!template) return '';
    return renderPrompt(template, lang, values);
  }, [template, lang, values]);


  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => toast.show(tq('Link copied!', '链接已复制！')));
  };

const handleSave = () => {
    if (!template) return;
    const id = generateId();
    const r = rendered;
    const p: Prompt = {
      id,
      yaml: "",
      meta: { name: template.meta.name, nameZh: template.meta.nameZh, description: template.meta.description, descriptionZh: template.meta.descriptionZh, tags: [...template.meta.tags], platform: template.meta.platform },
      variables: template.variables.map(v => ({ ...v })),
      system: {
        role: template.system.role || "", roleZh: template.system.roleZh,
        personality: template.system.personality, personalityZh: template.system.personalityZh,
        rules: [...(template.system.rules || [])], rulesZh: [...(template.system.rulesZh || [])],
        stop_rules: [...(template.system.stop_rules || [])], stop_rulesZh: [...(template.system.stop_rulesZh || [])]
      },
      user: r,
      userZh: lang === "zh-CN" ? r : undefined,
      source: "library",
      forkedFrom: template.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      versions: [],
    };
    savePrompt(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    track({ type: "template_save", templateId: template.id, lang });
  };
  const handleCopy = async () => {
    track({ type: 'template_copy', templateId: template!.id, lang });
    await copyToClipboard(rendered);
    setCopied(true);
    setFlash(true);
    setTimeout(() => { setCopied(false); setFlash(false); }, 2000);
  };
  if (!template) {
    return <div className="flex items-center justify-center h-full text-[var(--color-bench-muted)]">{t('detail.notFound')}</div>;
  }
  if (!ready) {
    return (
      <div className="flex flex-col lg:flex-row h-full">
        <div className="w-full lg:w-80 lg:border-r border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] p-5 space-y-4">
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
          <div className="px-5 py-3 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)]">
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="flex-1 p-6">
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
        <div className="p-5 border-b border-[var(--color-bench-border)]">
          <button onClick={() => navigate('/library')} className="flex items-center gap-1.5 text-xs text-[var(--color-bench-muted)] hover:text-[var(--color-bench-accent)] transition-colors mb-3">
            <ChevronLeftIcon size={12} className="" />
            {t('detail.back')}
          </button>
          <h2 className="text-lg font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{tName(template, lang)}</h2>
          <p className="text-sm text-[var(--color-bench-text-dim)] mt-1.5 leading-relaxed">{tShort(template, lang)}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {template.meta.tags.slice(0, 4).map((tag) => (<span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-[var(--color-bench-muted)]">{tag}</span>))}
          </div>
        </div>
        {template.variables.length > 0 && (
          <div className="p-5 border-b border-[var(--color-bench-border)]">
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
          <div className="px-5 py-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bench-muted)] mb-2 flex items-center gap-1">
              <Sparkles size={12} />{t('detail.tips')}
            </h3>
            <p className="text-sm text-[var(--color-bench-muted)] leading-relaxed">{tipsText}</p>
          </div>
        )}
      </div>
      {/* Right panel: preview */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-3 border-b border-[var(--color-bench-border)] flex items-center justify-between bg-[var(--color-bench-elevated)]">
          <span className="text-sm uppercase tracking-wider text-[var(--color-bench-muted)]">{tq('Prompt Output', 'Prompt 输出')}</span>
          <button onClick={handleCopy} className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (copied ? 'bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]' : 'bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] hover:brightness-110')}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('detail.copied') : t('detail.copy')}
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 transition-all"><Link2 size={14} />{tq("Share", "分享")}</button>
          <button onClick={handleSave} className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all " + (saved ? "bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]" : "bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20")}><Save size={14} />{t(saved ? "detail.saved" : "detail.save")}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bench-bg)]">
          <div className={'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden shadow-lg ' + (flash ? 'preview-flash' : '')}>
            <div className="px-5 py-3 border-b border-[var(--color-bench-border)] flex items-center gap-3 bg-[var(--color-bench-surface-solid)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]/20" />
              </div>
              <span className="text-xs text-[var(--color-bench-muted)] uppercase tracking-wider">{t('detail.preview')}</span>
            </div>
            <div className="p-6">
              <pre className="prompt-preview overflow-x-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-280px)]">{rendered || <span className="text-[var(--color-bench-muted)] italic">{t('detail.setValues')}</span>}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
