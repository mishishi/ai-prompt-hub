import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Sparkles, ChevronDown, ChevronRight, ChevronRightIcon, Home, GitFork, Edit3 } from 'lucide-react';
import { templates } from '../../data/templates';
import { tName, tShort, tDesc, tTips, tLabel, tOptions, tStage, tSkillWhen, tSkillHow } from '../../data/templates/helper';
import { renderPrompt } from '../../utils/renderer';
import { getPlatformLabel } from '../../utils/platform';
import { forkTemplate } from '../../store/myTemplates';
import { copyToClipboard } from '../../utils/clipboard';
import { DIFFICULTY_COLORS } from '../../utils/constants';
import { useT } from '../../i18n/LanguageContext';
import type { Platform } from '../../types';

const platforms: { id: Platform; color: string }[] = [
  { id: 'codex', color: 'var(--color-bench-accent)' },
  { id: 'claude', color: '#d29922' },
  { id: 'gpt', color: '#3fb950' },
];

export function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const template = templates.find((tmpl) => tmpl.id === id);
  const [platform, setPlatform] = useState<Platform>('codex');
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>({});
  const [copied, setCopied] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [flash, setFlash] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    skills: true,
    system: true,
    tips: true,
  });

  const toggleSection = (section: string) => setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/library'); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  useEffect(() => {
    if (template) {
      const defaults: Record<string, string | boolean | string[]> = {};
      template.variables.forEach((v) => { if (v.default !== undefined) defaults[v.name] = v.default; });
      setValues(defaults);
    }
  }, [template]);

  const rendered = useMemo(() => {
    if (!template) return '';
    return renderPrompt(template, platform, lang, values);
  }, [template, platform, lang, values]);

  const handleCopy = async () => { await copyToClipboard(rendered); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!template) {
    return <div className="flex items-center justify-center h-full text-[var(--color-bench-muted)]">{t('detail.notFound')}</div>;
  }

  const descZh = tDesc(template, lang);
  const tipsZh = tTips(template, lang);

  return (
    <div className="flex flex-col lg:flex-row h-full page-enter">
      <div className="w-full lg:w-80 lg:border-r border-b lg:border-b-0 border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] overflow-y-auto flex flex-col lg:max-h-full max-h-[50vh]">
        <div className="p-4 border-b border-[var(--color-bench-border)]">
          <nav className="flex items-center gap-1.5 text-xs mb-3 flex-wrap">
            <button onClick={() => navigate('/library')} className="flex items-center gap-1 text-[var(--color-bench-muted)] hover:text-[var(--color-bench-accent)] transition-colors">
              <Home size={12} />
              {t('detail.library')}
            </button>
            <ChevronRightIcon size={12} className="text-[var(--color-bench-muted)]/50" />
            {template.category && template.category.length > 0 && (
              <>
                <button onClick={() => navigate(`/library?category=${template.category[0]}`)} className="text-[var(--color-bench-muted)] hover:text-[var(--color-bench-accent)] transition-colors">
                  {t('category.' + template.category[0])}
                </button>
                <ChevronRightIcon size={12} className="text-[var(--color-bench-muted)]/50" />
              </>
            )}
            <span className="text-[var(--color-bench-text)] font-medium truncate max-w-[140px]">{tName(template, lang)}</span>
          </nav>
          <h2 className="text-lg font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{tName(template, lang)}</h2>
          <p className="text-xs text-[var(--color-bench-text-dim)] mt-1.5 leading-relaxed">{tShort(template, lang)}</p>
          {descZh && <p className="text-xs text-[var(--color-bench-muted)]/80 mt-2 leading-relaxed">{descZh}</p>}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={'text-xs px-2 py-1 rounded-md font-medium ' + (DIFFICULTY_COLORS[template.difficulty] || '')}>{t('difficulty.' + template.difficulty)}</span>
            {template.meta.tags.slice(0, 3).map((tag) => (<span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-[var(--color-bench-muted)]">{tag}</span>))}
          </div>
          <button
            onClick={() => {
              const fp = forkTemplate(template as any, template.id);
              navigate(`/edit/${fp.id}`);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20 border border-[var(--color-bench-accent)]/20 transition-colors"
          >
            <GitFork size={13} />
            {tq('Edit / Fork', '编辑 / Fork')}
          </button>
        </div>

        {template.variables.length > 0 && (
          <div className="p-5 border-b border-[var(--color-bench-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[var(--color-bench-muted)]">{t('detail.variables')}</h3>
              <span className="text-[11px] text-[var(--color-bench-muted)]/60">
                {(() => { const req = template.variables.filter(v => v.required).length; return lang === 'zh-CN' ? `${template.variables.length} 个变量，${req} 个必填` : `${template.variables.length} vars, ${req} required`; })()}
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
                      {v.required ? <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[var(--color-bench-error)]/10 text-[var(--color-bench-error)] uppercase">{t('detail.required_badge')}</span> : <span className="text-[10px] px-1.5 py-0.5 rounded text-[var(--color-bench-muted)]/50 uppercase">{t('detail.optional_badge')}</span>}
                    </label>
                    {v.type === 'enum' && options.length > 0 ? (
                      <select value={String(val ?? v.default ?? '')} onChange={(e) => setValues({ ...values, [v.name]: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-xs text-[var(--color-bench-text)] focus:outline-none focus:border-[var(--color-bench-accent)]">
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

        {(template as any).best_with && (template as any).best_with.length > 0 && (
          <div className="border-b border-[var(--color-bench-border)]">
            <button onClick={() => toggleSection('skills')} className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors">
              <span>{t('detail.skills')}</span>
              {collapsed.skills ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            {!collapsed.skills && (
              <div className="px-4 pb-4 space-y-2">
                {(template as any).best_with.map((s: any) => (
                  <div key={s.skill} className="p-2 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)]">
                    <div className="text-xs font-medium text-[var(--color-bench-accent)]">@{s.skill}</div>
                    <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{tSkillWhen(s, lang)}</div>
                    <div className="text-xs text-[var(--color-bench-muted)]/80 mt-0.5">{tSkillHow(s, lang)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(template.system?.role || (template.system?.rules?.length > 0)) && (
          <div className="border-b border-[var(--color-bench-border)]">
            <button onClick={() => toggleSection('system')} className="w-full flex items-center justify-between px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors">
              <span>{tq('System', '系统设定')}</span>
              {collapsed.system ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            {!collapsed.system && (
              <div className="px-5 pb-4">
                {template.system?.role && <p className="text-xs text-[var(--color-bench-accent)] mb-2">{lang === 'zh-CN' && template.system.roleZh ? template.system.roleZh : template.system.role}</p>}
                {((lang === 'zh-CN' && template.system?.rulesZh?.length > 0 ? template.system.rulesZh : template.system?.rules) || []).map((rule: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-bench-muted)] mb-1"><span className="text-[var(--color-bench-accent)] mt-0.5">•</span><span>{rule}</span></div>
                ))}
              </div>
            )}
          </div>
        )}

        {tipsZh && (
          <div>
            <button onClick={() => toggleSection('tips')} className="w-full flex items-center justify-between px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors">
              <span className="flex items-center gap-1"><Sparkles size={12} />{t('detail.tips')}</span>
              {collapsed.tips ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            {!collapsed.tips && <p className="px-5 pb-4 text-xs text-[var(--color-bench-muted)] leading-relaxed">{tipsZh}</p>}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-3 border-b border-[var(--color-bench-border)] flex items-center justify-between bg-[var(--color-bench-elevated)]">
          <div className="flex items-center gap-1">
            {platforms.map((p) => (
              <button key={p.id} onClick={() => setPlatform(p.id)} className={'px-3 py-1.5 rounded-md text-xs font-medium transition-colors ' + (platform === p.id ? 'bg-white/10 text-[var(--color-bench-text)]' : 'text-[var(--color-bench-muted)] hover:bg-white/5 hover:text-[var(--color-bench-text)]')}>
                {getPlatformLabel(p.id)}
              </button>
            ))}
          </div>
          <button onClick={handleCopy} className={'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ' + (copied ? 'bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]' : 'bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] hover:brightness-110')}>
            {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('detail.copied') : t('detail.copy')}
          </button>
        </div>

        {template.stages && template.stages.length > 0 && (
          <div className="flex items-center gap-1 px-4 py-2 bg-[var(--color-bench-bg)] border-b border-[var(--color-bench-border)] overflow-x-auto">
            <button onClick={() => setActiveStage(-1)} className={'px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ' + (activeStage === -1 ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)]' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]')}>{t('detail.fullPrompt')}</button>
            {template.stages.map((s: any, i: number) => (<button key={i} onClick={() => setActiveStage(i)} className={'px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ' + (activeStage === i ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)]' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]')}>{i + 1}. {tStage(s, lang)}</button>))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bench-bg)]">
          <div className={'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden shadow-lg ' + (flash ? 'preview-flash' : '')}>
            {/* Document header */}
            <div className="px-5 py-3 border-b border-[var(--color-bench-border)] flex items-center gap-3 bg-[var(--color-bench-surface-solid)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-bench-accent)]/20" />
              </div>
              <span className="text-[11px] text-[var(--color-bench-muted)] uppercase tracking-wider">{t('detail.preview')}</span>
              <span className="text-[11px] text-[var(--color-bench-text-dim)]">·</span>
              <span className="text-[11px] text-[var(--color-bench-text-dim)]">{getPlatformLabel(platform)}</span>
            </div>
            {/* Document body */}
            <div className="p-6">
              <pre className="text-sm text-[var(--color-bench-text)] leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto max-h-[calc(100vh-280px)]">{rendered || <span className="text-[var(--color-bench-muted)] italic">{t('detail.setValues')}</span>}</pre>
            </div>
            {/* Document footer */}
            <div className="px-5 py-2 border-t border-[var(--color-bench-border)] flex items-center justify-between bg-[var(--color-bench-surface-solid)]">
              <span className="text-[10px] text-[var(--color-bench-muted)] uppercase tracking-wider">{tq('Prompt Specification', 'Prompt 规范文档')}</span>
              <span className="text-[10px] text-[var(--color-bench-muted)]">{platform}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}