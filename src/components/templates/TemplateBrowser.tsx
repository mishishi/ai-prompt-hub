import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Zap } from 'lucide-react';
import { templates, categories, getTemplatesByCategory, searchTemplates } from '../../data/templates';
import { TemplateCard } from './TemplateCard';
import { useT } from '../../i18n/LanguageContext';

export function TemplateBrowser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang } = useT();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category') || null);

  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      searchRef.current?.focus();
      searchRef.current?.select();
    }
  }, []);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (search.trim()) return searchTemplates(search);
    if (activeCategory) return getTemplatesByCategory(activeCategory);
    return templates;
  }, [search, activeCategory]);


  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bench-accent)]/10 flex items-center justify-center"><Sparkles size={20} className="text-[var(--color-bench-accent)]" /></div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{t('browser.title')}</h2>
          <p className="text-sm text-[var(--color-bench-text-dim)]">{t('browser.subtitle')}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bench-muted)]" />
        <input ref={searchRef} type="text" placeholder={`${t('browser.search')} (${t('browser.searchHint')})`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-16 py-3 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)] transition-colors" /><kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10 text-[var(--color-bench-muted)]">{t("browser.shortcut")}</kbd>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${!activeCategory ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-[0_0_12px_var(--color-bench-accent-glow)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{t('browser.all')} ({templates.length})</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeCategory === cat.id ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-[0_0_12px_var(--color-bench-accent-glow)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{t('category.' + cat.id)}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4"><Search size={24} className="text-[var(--color-bench-muted)]" /></div>
          <p className="text-base text-[var(--color-bench-text-dim)] mb-1">{t('browser.empty')}</p>
          <p className="text-sm text-[var(--color-bench-muted)] mb-6">{t('browser.emptyHint')}</p>
          <button onClick={() => navigate('/generate')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] text-sm font-medium hover:bg-[var(--color-bench-accent)]/20 transition-colors cursor-pointer"><Zap size={14} />{lang === 'zh-CN' ? 'AI 生成一个同款' : 'Generate one with AI'}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tmpl, i) => (<div key={tmpl.id} className={`card-enter stagger-${(i % 4) + 1}`}><TemplateCard template={tmpl} onClick={() => navigate('/template/' + tmpl.id)} /></div>))}
        </div>
      )}
    </div>
  );
}
