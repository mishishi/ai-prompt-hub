import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Zap, Star, Globe } from 'lucide-react';
import { templates, categories, getTemplatesByCategory, searchTemplates } from '../../data/templates';
import type { LibraryTemplate } from '../../types';
import { getFavorites } from '../../utils/storage';
import { TemplateCard } from './TemplateCard';
import { useT } from '../../i18n/LanguageContext';
import { getEvents } from '../../utils/analytics';
import { aggregateEvents, calcScore } from '../../utils/scoring';

export function TemplateBrowser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category') || null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [communityTpls, setCommunityTpls] = useState<LibraryTemplate[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'score'>('default');
  const [copyTicker, setCopyTicker] = useState(0);
  const favorites = useMemo(() => getFavorites(), []);

  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      searchRef.current?.focus();
      searchRef.current?.select();
    }
  }, []);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchCommunity = () => {
    if (communityTpls.length > 0 && showCommunity) return;
    setCommunityLoading(true);
    fetch('/api/community?sort=popular&limit=30')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          const mapped: LibraryTemplate[] = data.templates.map((t: any) => ({
            id: t.id,
            meta: { name: t.name, description: t.description, tags: t.tags, platform: 'claude' as const },
            variables: [],
            system: { role: '' },
            user: t.prompt,
            category: [t.category],
            difficulty: t.difficulty,
            _community: true,
            _authorName: t.authorName,
            _likes: t.likes,
            _copies: t.copies,
          } as any));
          setCommunityTpls(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setCommunityLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const events = useMemo(() => getEvents(), []);

  const templateScores = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const tmpl of templates) {
      const agg = aggregateEvents(events, tmpl.id);
      scores[tmpl.id] = calcScore(agg);
    }
    return scores;
  }, [events]);

  const copyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tmpl of templates) {
      const agg = aggregateEvents(events, tmpl.id);
      counts[tmpl.id] = agg.copies;
    }
    return counts;
  }, [events, copyTicker]);

  const filtered = useMemo(() => {
    if (showCommunity) return communityTpls as any;
    let results = templates;
    if (search.trim()) results = searchTemplates(search);
    else if (activeCategory) results = getTemplatesByCategory(activeCategory);
    if (showFavorites) results = results.filter(t => favorites.includes(t.id));
    if (difficulty) results = results.filter(t => t.difficulty === difficulty);

    // Sort: score toggle first, then search relevance, otherwise default
    if (sortBy === 'score') {
      results = [...results].sort((a, b) => (templateScores[b.id] || 0) - (templateScores[a.id] || 0));
    } else if (search.trim()) {
      // Search mode: sort by match quality + score
      const q = search.toLowerCase();
      const matchScore = (t: any) => {
        let s = 0;
        if (t.meta.name.toLowerCase() === q) s += 5;
        else if (t.meta.name.toLowerCase().includes(q)) s += 3;
        if (t.meta.nameZh && t.meta.nameZh.toLowerCase().includes(q)) s += 3;
        if (t.meta.description.toLowerCase().includes(q)) s += 1;
        if (t.meta.descriptionZh && t.meta.descriptionZh.toLowerCase().includes(q)) s += 1;
        return s;
      };
      results = [...results].sort((a, b) => {
        const scoreA = matchScore(a) * 10 + (templateScores[a.id] || 0) * 0.6;
        const scoreB = matchScore(b) * 10 + (templateScores[b.id] || 0) * 0.6;
        return scoreB - scoreA;
      });
    }

    return results;
  }, [search, activeCategory, showFavorites, favorites, difficulty, showCommunity, communityTpls, sortBy, templateScores]);


  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 page-enter">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bench-accent)]/10 flex items-center justify-center"><Sparkles size={20} className="text-[var(--color-bench-accent)]" /></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{t('browser.title')}</h2>
          <p className="text-sm text-[var(--color-bench-text-dim)]">{t('browser.subtitle')}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bench-muted)]" />
        <input ref={searchRef} type="text" placeholder={`${t('browser.search')} (${t('browser.searchHint')})`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full pl-10 pr-16 py-3 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)] transition-colors" /><kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-medium bg-white/5 border border-white/10 text-[var(--color-bench-muted)]">{t("browser.shortcut")}</kbd>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1 flex-nowrap md:flex-wrap">
        <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${!activeCategory ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-[0_0_12px_var(--color-bench-accent-glow)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{t('browser.all')} ({showCommunity ? communityTpls.length : templates.length})</button>
        <button onClick={() => { setShowFavorites(!showFavorites); if (!showFavorites) setActiveCategory(null); }} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${showFavorites ? 'bg-[var(--color-bench-warn)]/15 text-[var(--color-bench-warn)] shadow-[0_0_12px_var(--color-bench-warn)]/20' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}><Star size={12} fill={showFavorites ? 'currentColor' : 'none'} />{t('browser.favorites')} ({favorites.length})</button>
        <button onClick={() => { setShowCommunity(!showCommunity); if (!showCommunity) fetchCommunity(); setShowFavorites(false); setActiveCategory(null); }} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${showCommunity ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-[0_0_12px_var(--color-bench-accent-glow)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}><Globe size={12} />{tq('Community', '社区')}</button>
        {!showCommunity && categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeCategory === cat.id ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-[0_0_12px_var(--color-bench-accent-glow)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{t('category.' + cat.id)}</button>
        ))}
      
        <button onClick={() => setSortBy(sortBy === 'score' ? 'default' : 'score')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${sortBy === 'score' ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{tq('Top Rated', '最高评分')}</button>
        {!showCommunity && <span className="text-[var(--color-bench-border)] mx-1">|</span>}
        {!showCommunity && ['Beginner','Intermediate','Advanced'].map(d => (
          <button key={d} onClick={() => setDifficulty(difficulty === d ? null : d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${difficulty === d ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>{t('difficulty.' + d)}</button>
        ))}
</div>

      {communityLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-xl bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          {showFavorites ? (
            <>
              <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4"><Star size={24} className="text-[var(--color-bench-muted)]" /></div>
              <p className="text-sm text-[var(--color-bench-text-dim)] mb-1">{t('browser.favoritesEmpty')}</p>
              <p className="text-sm text-[var(--color-bench-muted)] mb-6">{tq('Browse templates and star the ones you like', '浏览模板库，点击星标收藏你喜欢的模板')}</p>
              <button onClick={() => setShowFavorites(false)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] text-sm font-medium hover:bg-[var(--color-bench-accent)]/20 transition-colors cursor-pointer">{tq('Browse all templates', '浏览全部模板')}</button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4"><Search size={24} className="text-[var(--color-bench-muted)]" /></div>
              <p className="text-sm text-[var(--color-bench-text-dim)] mb-1">{t('browser.empty')}</p>
              <p className="text-sm text-[var(--color-bench-muted)] mb-6">{t('browser.emptyHint')}</p>
              <button onClick={() => navigate('/generate')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] text-sm font-medium hover:bg-[var(--color-bench-accent)]/20 transition-colors cursor-pointer"><Zap size={14} />{tq('Generate one with AI', 'AI 生成一个同款')}</button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tmpl: any, i: number) => (<div key={tmpl.id} className={`card-enter stagger-${(i % 4) + 1}`}><TemplateCard template={tmpl} score={templateScores[tmpl.id]} copyCount={copyCounts[tmpl.id]} onClick={() => navigate('/template/' + tmpl.id)} onCopy={() => setCopyTicker(t => t + 1)} /></div>))}
        </div>
      )}
    </div>
  );
}
