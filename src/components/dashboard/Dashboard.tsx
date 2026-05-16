import { useMemo, useState } from 'react';
import { BarChart3, Eye, Copy, Zap, ThumbsUp, TrendingUp, RefreshCw, Star } from 'lucide-react';
import { getEvents } from '../../utils/analytics';
import { templates } from '../../data/templates';
import { tName } from '../../data/templates/helper';
import { getFavorites } from '../../utils/storage';
import type { AnalyticsEvent } from '../../utils/analytics';
import { useT } from '../../i18n/LanguageContext';

export function Dashboard() {
  const { t, lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  const [today, setToday] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const events: AnalyticsEvent[] = useMemo(() => getEvents(), [refreshKey]);
  const favorites = useMemo(() => getFavorites(), [refreshKey]);

  // Filter by today if toggle is on
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = todayStart.getTime();

  const filteredEvents = today ? events.filter(e => e.timestamp >= todayTs) : events;

  // Compute stats from filtered events
  const filteredStats = useMemo(() => {
    const views: Record<string, number> = {};
    const copies: Record<string, number> = {};
    let aiGen = 0;
    for (const e of filteredEvents) {
      if (e.type === 'template_view' && e.templateId) views[e.templateId] = (views[e.templateId] || 0) + 1;
      if (e.type === 'template_copy' && e.templateId) copies[e.templateId] = (copies[e.templateId] || 0) + 1;
      if (e.type === 'ai_generate') aiGen++;
    }
    return { views, copies, aiGen };
  }, [filteredEvents]);

  // Template feedback
  const feedbackData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('promptbench-tpl-feedback') || '[]');
    } catch { return []; }
  }, [refreshKey]);
  const thumbsUp = feedbackData.filter((f: any) => f.value === 'up').length;
  const feedbackTotal = feedbackData.length;

  // Leaderboard: sort by copies, then views
  const leaderboard = useMemo(() => {
    const allIds = new Set([...Object.keys(filteredStats.copies), ...Object.keys(filteredStats.views)]);
    return Array.from(allIds)
      .map(id => ({
        id,
        views: filteredStats.views[id] || 0,
        copies: filteredStats.copies[id] || 0,
        favs: favorites.includes(id) ? 1 : 0,
      }))
      .sort((a, b) => b.copies - a.copies || b.views - a.views)
      .slice(0, 8);
  }, [filteredStats, favorites]);

  // Category distribution
  const catDist = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const e of filteredEvents) {
      if (e.type !== 'template_view') continue;
      const tmpl = templates.find(t => t.id === e.templateId);
      if (tmpl) {
        tmpl.category.forEach(c => { dist[c] = (dist[c] || 0) + 1; });
      }
    }
    return Object.entries(dist).sort(([, a], [, b]) => b - a).slice(0, 6);
  }, [filteredEvents]);
  const maxCat = Math.max(1, ...catDist.map(([, n]) => n));

  // Recent events
  const recentEvents = useMemo(() => filteredEvents.slice(-10).reverse(), [filteredEvents]);

  const templateName = (id: string) => {
    const tmpl = templates.find(t => t.id === id);
    return tmpl ? tName(tmpl, lang) : id;
  };
  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return tq(s + 's', s + '秒前');
    if (s < 3600) return tq(Math.floor(s / 60) + 'm', Math.floor(s / 60) + '分钟前');
    return tq(Math.floor(s / 3600) + 'h', Math.floor(s / 3600) + '小时前');
  };
  const totalEvents = today ? events.filter(e => e.timestamp >= todayTs).length : events.length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-bench-accent)]/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-[var(--color-bench-accent)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">
              {tq('Analytics', '效果追踪')}
            </h2>
            <p className="text-sm text-[var(--color-bench-text-dim)]">
              {tq('Usage overview for your prompts', 'Prompt 使用情况概览')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setToday(!today)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${today ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)]'}`}>
            {tq('Today', '今日')}
          </button>
          <button onClick={() => setRefreshKey(k => k + 1)} className="p-2 rounded-lg text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] hover:bg-[var(--color-bench-elevated)] transition-colors cursor-pointer">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {totalEvents === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-[var(--color-bench-muted)]" />
          </div>
          <p className="text-sm text-[var(--color-bench-text-dim)]">{tq('No data yet', '暂无数据')}</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-4">
              <Eye size={14} className="text-[var(--color-bench-accent)] mb-2" />
              <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{totalEvents}</div>
              <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{tq('Views', '查看')}</div>
            </div>
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-4">
              <Copy size={14} className="text-[var(--color-bench-success)] mb-2" />
              <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{Object.values(filteredStats.copies).reduce((a, b) => a + b, 0)}</div>
              <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{tq('Copies', '复制')}</div>
            </div>
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-4">
              <Zap size={14} className="text-[var(--color-bench-warn)] mb-2" />
              <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{filteredStats.aiGen}</div>
              <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{tq('Generated', '生成')}</div>
            </div>
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-4">
              <Star size={14} className="text-[var(--color-bench-warn)] mb-2" />
              <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{favorites.length}</div>
              <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{tq('Favorites', '收藏')}</div>
            </div>
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-4">
              <ThumbsUp size={14} className="text-[var(--color-bench-success)] mb-2" />
              <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{feedbackTotal > 0 ? Math.round((thumbsUp / feedbackTotal) * 100) + '%' : '--'}</div>
              <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{tq('Helpful', '好评率')}</div>
            </div>
          </div>

          {/* Template Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="mb-8 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)] flex items-center gap-2">
                <TrendingUp size={14} className="text-[var(--color-bench-accent)]" />
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('Template Leaderboard', '模板排行榜')}</h3>
                <span className="text-xs text-[var(--color-bench-muted)] ml-1">{tq('by copies', '按复制量')}</span>
              </div>
              <div className="divide-y divide-[var(--color-bench-border)]/50">
                {leaderboard.map((item, i) => (
                  <div key={item.id} className="flex items-center px-5 py-3 gap-4">
                    <span className="text-sm font-bold text-[var(--color-bench-muted)] w-5">{i + 1}</span>
                    <span className="flex-1 text-sm text-[var(--color-bench-text)] truncate">{templateName(item.id)}</span>
                    <span className="flex items-center gap-1 text-xs text-[var(--color-bench-muted)]"><Eye size={11} />{item.views}</span>
                    <span className="flex items-center gap-1 text-xs text-[var(--color-bench-success)]"><Copy size={11} />{item.copies}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Distribution */}
          {catDist.length > 0 && (
            <div className="mb-8 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('Category Distribution', '分类分布')}</h3>
              </div>
              <div className="p-5 space-y-3">
                {catDist.map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--color-bench-text)]">{t('category.' + cat)}</span>
                      <span className="text-[var(--color-bench-muted)]">{Math.round((count / maxCat) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--color-bench-bg)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--color-bench-accent)] transition-all" style={{ width: Math.round((count / maxCat) * 100) + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentEvents.length > 0 && (
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('Recent Activity', '最近动态')}</h3>
              </div>
              <div className="p-4 space-y-2">
                {recentEvents.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {e.type === 'template_view' ? <Eye size={12} className="text-[var(--color-bench-accent)] flex-shrink-0" />
                     : e.type === 'template_copy' ? <Copy size={12} className="text-[var(--color-bench-success)] flex-shrink-0" />
                     : e.type === 'ai_generate' ? <Zap size={12} className="text-[var(--color-bench-accent)] flex-shrink-0" />
                     : <Copy size={12} className="text-[var(--color-bench-success)] flex-shrink-0" />}
                    <span className="text-[var(--color-bench-muted)]">
                      {e.type === 'template_view' && tq('Viewed', '查看了') + ' ' + templateName(e.templateId || '')}
                      {e.type === 'template_copy' && tq('Copied', '复制了') + ' ' + templateName(e.templateId || '')}
                      {e.type === 'ai_generate' && tq('Generated a prompt', '生成了一个 Prompt')}
                      {e.type === 'ai_copy' && tq('Copied AI result', '复制了 AI 结果')}
                      {e.type === 'ai_feedback' && tq('Left feedback', '留下了反馈')}
                    </span>
                    <span className="text-[var(--color-bench-muted)]/50 text-xs">{timeAgo(e.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
