import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { BarChart3, Eye, Copy, Zap, ThumbsUp, RefreshCw, Star, TrendingUp, User, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getEvents } from '../../utils/analytics';
import { templates } from '../../data/templates';
import { tName } from '../../data/templates/helper';
import { getFavorites } from '../../utils/storage';
import type { AnalyticsEvent } from '../../utils/analytics';
import { useT } from '../../i18n/LanguageContext';

const CHART_COLORS = ['#d4a843', '#7c8aa5', '#5aab7a', '#c47a5a', '#8b7aaf', '#5a9eaa', '#b8943b', '#6b8a6b'];

export function Dashboard() {
  const { t, lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  const [today, setToday] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kvData, setKvData] = useState<any>(null);
  const [kvLoading, setKvLoading] = useState(false);

  useEffect(() => {
    setKvLoading(true);
    fetch(`/api/stats${today ? '?today=1' : ''}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setKvData(data); })
      .catch(() => {})
      .finally(() => setKvLoading(false));
  }, [refreshKey, today]);

  const events: AnalyticsEvent[] = useMemo(() => getEvents(), [refreshKey]);
  const favorites = useMemo(() => getFavorites(), [refreshKey]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = todayStart.getTime();
  const filteredEvents = today ? events.filter(e => e.timestamp >= todayTs) : events;

  const mergedEvents = useMemo(() => {
    if (!kvData?.events) return filteredEvents;
    const localIds = new Set(filteredEvents.map((e: any) => e.timestamp + (e.templateId || '')));
    const kvEvents = kvData.events.filter((e: any) => !localIds.has(e.timestamp + (e.templateId || '')));
    return [...filteredEvents, ...kvEvents].sort((a: any, b: any) => a.timestamp - b.timestamp);
  }, [filteredEvents, kvData]);

  // Stats from filtered events
  const filteredStats = useMemo(() => {
    const views: Record<string, number> = {};
    const copies: Record<string, number> = {};
    let aiGen = 0;
    let aiCopy = 0;
    for (const e of mergedEvents) {
      if (e.type === 'template_view' && e.templateId) views[e.templateId] = (views[e.templateId] || 0) + 1;
      if (e.type === 'template_copy' && e.templateId) copies[e.templateId] = (copies[e.templateId] || 0) + 1;
      if (e.type === 'ai_generate') aiGen++;
      if (e.type === 'ai_copy') aiCopy++;
    }
    return { views, copies, aiGen, aiCopy };
  }, [filteredEvents]);

  // Template feedback
  const feedbackData = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('promptbench-tpl-feedback') || '[]'); }
    catch { return []; }
  }, [refreshKey]);
  const thumbsUp = feedbackData.filter((f: any) => f.value === 'up').length;
  const feedbackTotal = feedbackData.length;

  const templateName = (id: string) => {
    const tmpl = templates.find(tpl => tpl.id === id);
    return tmpl ? tName(tmpl, lang) : id;
  };
  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return tq(s + 's', s + '秒前');
    if (s < 3600) return tq(Math.floor(s / 60) + 'm', Math.floor(s / 60) + '分钟前');
    if (s < 86400) return tq(Math.floor(s / 3600) + 'h', Math.floor(s / 3600) + '小时前');
    return tq(Math.floor(s / 86400) + 'd', Math.floor(s / 86400) + '天前');
  };

  // Leaderboard data for chart
  const leaderboard = useMemo(() => {
    const allIds = new Set([...Object.keys(filteredStats.copies), ...Object.keys(filteredStats.views)]);
    return Array.from(allIds)
      .map(id => ({
        name: templateName(id),
        views: filteredStats.views[id] || 0,
        copies: filteredStats.copies[id] || 0,
      }))
      .sort((a, b) => b.copies - a.copies || b.views - a.views)
      .slice(0, 8);
  }, [filteredStats]);

  // Category distribution for chart
  const catDist = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const e of mergedEvents) {
      if (e.type !== 'template_view') continue;
      const tmpl = templates.find(tpl => tpl.id === e.templateId);
      if (tmpl) tmpl.category.forEach(c => { dist[c] = (dist[c] || 0) + 1; });
    }
    return Object.entries(dist)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat, count]) => ({ name: t('category.' + cat), count }));
  }, [filteredEvents, lang]);

  // User activity stats
  const userStats = useMemo(() => {
    const users: Record<string, { name: string; views: number; copies: number; gens: number; lastSeen: number }> = {};
    for (const e of mergedEvents) {
      if (!e.userId) continue;
      const u = e.userId;
      if (!users[u]) users[u] = { name: e.userName || 'Unknown', views: 0, copies: 0, gens: 0, lastSeen: 0 };
      if (e.type === 'template_view') users[u].views++;
      if (e.type === 'template_copy') users[u].copies++;
      if (e.type === 'ai_generate') users[u].gens++;
      if (e.timestamp > users[u].lastSeen) users[u].lastSeen = e.timestamp;
    }
    return Object.entries(users)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.views + b.copies + b.gens) - (a.views + a.copies + a.gens));
  }, [mergedEvents]);

  const activeToday = userStats.filter(u => u.lastSeen >= todayTs).length;

  // Provider distribution
  const providerDist = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const e of mergedEvents) {
      if (e.provider) dist[e.provider] = (dist[e.provider] || 0) + 1;
    }
    return Object.entries(dist).sort(([,a], [,b]) => b - a);
  }, [mergedEvents]);

  // 7-day trend
  const trendData = useMemo(() => {
    if (kvData?.trend) return kvData.trend;
    const days: { date: string; views: number; copies: number; gens: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;
      const dayEvents = events.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd);
      days.push({
        date: d.toLocaleDateString(lang === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }),
        views: dayEvents.filter(e => e.type === 'template_view').length,
        copies: dayEvents.filter(e => e.type === 'template_copy').length,
        gens: dayEvents.filter(e => e.type === 'ai_generate').length,
      });
    }
    return days;
  }, [events, lang]);

  // Recent events
  const recentEvents = useMemo(() => mergedEvents.slice(-8).reverse(), [mergedEvents]);



  const totalViews = Object.values(filteredStats.views).reduce((a, b) => a + b, 0);
  const totalCopies = Object.values(filteredStats.copies).reduce((a, b) => a + b, 0);
  const hasData = filteredEvents.length > 0;

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
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setToday(!today)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${today ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)]' : 'bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)]'}`}>
            {tq('Today', '今日')}
          </button>
          <button onClick={() => setRefreshKey(k => k + 1)} className="p-2 rounded-lg text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] hover:bg-[var(--color-bench-elevated)] transition-colors cursor-pointer">
            <RefreshCw size={14} className={kvLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-[var(--color-bench-muted)]" />
          </div>
          <p className="text-sm text-[var(--color-bench-text-dim)]">{tq('No data yet', '暂无数据')}</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Eye} color="accent" value={totalViews} label={tq('Views', '查看')} />
            <StatCard icon={Copy} color="success" value={totalCopies} label={tq('Copies', '复制')} />
            <StatCard icon={Zap} color="warn" value={filteredStats.aiGen} label={tq('Generated', '生成')} />
            <StatCard icon={Star} color="warn" value={favorites.length} label={tq('Favorites', '收藏')} />
            <StatCard icon={ThumbsUp} color="success" value={feedbackTotal > 0 ? Math.round((thumbsUp / feedbackTotal) * 100) + '%' : '--'} label={tq('Helpful', '好评率')} />
          </div>

          {userStats.length > 0 && (
        <ChartCard title={tq('User Activity', '用户活跃度')} icon={Users} className="mb-8">
          <div className="flex items-center gap-6 mb-4">
            <div>
              <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{userStats.length}</div>
              <div className="text-xs text-[var(--color-bench-muted)]">{tq('Total Users', '总用户数')}</div>
            </div>
            <div className="w-px h-8 bg-[var(--color-bench-border)]" />
            <div>
              <div className="text-2xl font-bold text-[var(--color-bench-success)] font-[var(--font-display)]">{activeToday}</div>
              <div className="text-xs text-[var(--color-bench-muted)]">{tq('Active Today', '今日活跃')}</div>
            </div>
            {providerDist.length > 0 && (
              <>
                <div className="w-px h-8 bg-[var(--color-bench-border)]" />
                {providerDist.map(([provider, count]) => (
                  <div key={provider} className="flex items-center gap-1.5">
                    <span className="text-sm">{provider === 'github' ? '🐙' : provider === 'google' ? '🅶' : '🔑'}</span>
                    <span className="text-sm font-semibold text-[var(--color-bench-text)]">{count}</span>
                    <span className="text-xs text-[var(--color-bench-muted)]">{provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : provider}</span>
                  </div>
                ))}
              </>
            )}
          </div>
          <ResponsiveContainer width="100%" height={Math.max(150, userStats.length * 36)}>
            <BarChart data={userStats.slice(0, 8)} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bench-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-bench-muted)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-bench-text-dim)' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ background: 'var(--color-bench-surface-solid)', border: '1px solid var(--color-bench-border)', borderRadius: '0.75rem', fontSize: '0.75rem', color: 'var(--color-bench-text)' }} />
              <Bar dataKey="views" stackId="a" fill="#d4a843" radius={[0, 0, 0, 0]} name={tq('Views', '查看')} />
              <Bar dataKey="copies" stackId="a" fill="#5aab7a" radius={[0, 0, 0, 0]} name={tq('Copies', '复制')} />
              <Bar dataKey="gens" stackId="a" fill="#7c8aa5" radius={[0, 4, 4, 0]} name={tq('Generated', '生成')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 7-Day Trend Chart */}
            <ChartCard title={tq('7-Day Trend', '7 天趋势')} icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bench-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-bench-muted)' }} axisLine={{ stroke: 'var(--color-bench-border)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-bench-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-bench-surface-solid)', border: '1px solid var(--color-bench-border)', borderRadius: '0.75rem', fontSize: '0.75rem', color: 'var(--color-bench-text)' }} />
                  <Bar dataKey="views" fill="#d4a843" radius={[4, 4, 0, 0]} name={tq('Views', '查看')} />
                  <Bar dataKey="copies" fill="#5aab7a" radius={[4, 4, 0, 0]} name={tq('Copies', '复制')} />
                  <Bar dataKey="gens" fill="#7c8aa5" radius={[4, 4, 0, 0]} name={tq('Generated', '生成')} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Category Distribution Chart */}
            <ChartCard title={tq('Category Distribution', '分类分布')} icon={BarChart3}>
              {catDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={catDist} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bench-border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-bench-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-bench-text-dim)' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ background: 'var(--color-bench-surface-solid)', border: '1px solid var(--color-bench-border)', borderRadius: '0.75rem', fontSize: '0.75rem', color: 'var(--color-bench-text)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {catDist.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-[var(--color-bench-muted)] text-center py-10">{tq('No data', '暂无数据')}</p>
              )}
            </ChartCard>
          </div>

          {/* Template Leaderboard Chart */}
          {leaderboard.length > 0 && (
            <ChartCard title={tq('Template Leaderboard', '模板排行榜')} icon={TrendingUp} className="mb-8">
              <ResponsiveContainer width="100%" height={Math.max(200, leaderboard.length * 32)}>
                <BarChart data={leaderboard} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bench-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-bench-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-bench-text-dim)' }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip contentStyle={{ background: 'var(--color-bench-surface-solid)', border: '1px solid var(--color-bench-border)', borderRadius: '0.75rem', fontSize: '0.75rem', color: 'var(--color-bench-text)' }} />
                  <Bar dataKey="views" stackId="a" fill="#d4a843" radius={[0, 0, 0, 0]} name={tq('Views', '查看')} />
                  <Bar dataKey="copies" stackId="a" fill="#5aab7a" radius={[0, 4, 4, 0]} name={tq('Copies', '复制')} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
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
                     : e.type === 'ai_generate' ? <Zap size={12} className="text-[var(--color-bench-warn)] flex-shrink-0" />
                     : <Copy size={12} className="text-[var(--color-bench-success)] flex-shrink-0" />}
                    <span className="text-[var(--color-bench-muted)] truncate">
                      {e.type === 'template_view' && tq('Viewed', '查看了') + ' ' + templateName(e.templateId || '')}
                      {e.type === 'template_copy' && tq('Copied', '复制了') + ' ' + templateName(e.templateId || '')}
                      {e.type === 'ai_generate' && tq('Generated a prompt', '生成了一个 Prompt')}
                      {e.type === 'ai_copy' && tq('Copied AI result', '复制了 AI 结果')}
                      {e.type === 'ai_feedback' && tq('Left feedback', '留下了反馈')}
                      {e.userName && <span className="text-[var(--color-bench-muted)]/70 text-xs flex items-center gap-0.5"><User size={10} />{e.userName}</span>}
                    </span>
                    <span className="text-[var(--color-bench-muted)]/50 text-xs ml-auto flex-shrink-0">{timeAgo(e.timestamp)}</span>
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

function StatCard({ icon: Icon, color, value, label }: {
  icon: any; color: string; value: number | string; label: string;
}) {
  const colorMap: Record<string, string> = {
    accent: 'text-[var(--color-bench-accent)]',
    success: 'text-[var(--color-bench-success)]',
    warn: 'text-[var(--color-bench-warn)]',
    error: 'text-[var(--color-bench-error)]',
  };
  return (
    <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-4">
      <Icon size={14} className={(colorMap[color] || '') + ' mb-2'} />
      <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{value}</div>
      <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{label}</div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, className = '' }: {
  title: string; icon: any; children: ReactNode; className?: string;
}) {
  return (
    <div className={`bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)] flex items-center gap-2">
        <Icon size={14} className="text-[var(--color-bench-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
