import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { templates, categories, getTemplatesByCategory, searchTemplates } from '../../data/templates';
import { TemplateCard } from './TemplateCard';
import { useT } from '../../i18n/LanguageContext';

export function TemplateBrowser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useT();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category') || null);
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => t.category.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
    return counts;
  }, []);

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
        <input ref={searchRef} type="text" placeholder={t('browser.search') + ' (press /)'} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)] transition-colors" />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${!activeCategory ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-[0_0_12px_var(--color-bench-accent-glow)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{t('browser.all')} ({templates.length})</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeCategory === cat.id ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-[0_0_12px_var(--color-bench-accent-glow)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{t('category.' + cat.id)} ({categoryCounts[cat.id] || 0})</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4"><Search size={24} className="text-[var(--color-bench-muted)]" /></div>
          <p className="text-base text-[var(--color-bench-text-dim)] mb-1">{t('browser.empty')}</p>
          <p className="text-sm text-[var(--color-bench-muted)]">{t('browser.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tmpl, i) => (<div key={tmpl.id} className={`card-enter stagger-${(i % 4) + 1}`}><TemplateCard template={tmpl} onClick={() => navigate('/template/' + tmpl.id)} /></div>))}
        </div>
      )}
    </div>
  );
}