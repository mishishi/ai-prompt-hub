import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { BarChart3, Eye, Copy, Zap, ThumbsUp, RefreshCw, Star, TrendingUp, User, Users, Activity, Layers, UserPlus, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line,
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
  const shortName = (name: string) => name.includes("@") ? name.split("@")[0] : (name.length > 15 ? name.slice(0, 14) + "…" : name);
  const [today, setToday] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [kvData, setKvData] = useState<any>(null);
  const [kvLoading, setKvLoading] = useState(false);
  const [communityNames, setCommunityNames] = useState<Record<string, string>>({});

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

  // Fetch community template names for Dashboard display
  useEffect(() => {
    const ids = mergedEvents
      .filter((e: any) => e.templateId && !templates.find(t => t.id === e.templateId) && !communityNames[e.templateId])
      .map((e: any) => e.templateId);
    const unique = [...new Set(ids)].slice(0, 10);
    if (!unique.length) return;
    Promise.all(unique.map(id =>
      fetch('/api/community/' + id).then(r => r.json()).then(d => ({ id, name: d?.template?.name })).catch(() => ({ id, name: null }))
    )).then(results => {
      const map: Record<string, string> = { ...communityNames };
      results.forEach((r: any) => { if (r.name) map[r.id] = r.name; });
      setCommunityNames(map);
    });
  }, [mergedEvents]);

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
    if (id.length > 30) return communityNames[id] || (lang === 'zh-CN' ? '社区模板' : 'Community');
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
  }, [filteredStats, lang]);

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
      if (!users[u]) users[u] = { name: shortName(e.userName || 'Unknown'), views: 0, copies: 0, gens: 0, lastSeen: 0 };
      // Always update name from latest (new Clerk names override old email prefixes)
      if (e.userName) users[u].name = shortName(e.userName);
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
  // ---- DAU / WAU / MAU ----
  const dauWauMau = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const dailyUsers: Record<string, Set<string>> = {};
    for (const e of mergedEvents) {
      if (!e.userId) continue;
      const day = new Date(e.timestamp).toLocaleDateString();
      if (!dailyUsers[day]) dailyUsers[day] = new Set();
      dailyUsers[day].add(e.userId);
    }
    const result: { date: string; dau: number; wau: number; mau: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const dateStr = d.toLocaleDateString();
      const daySet = dailyUsers[dateStr] || new Set();
      const wauSet = new Set<string>();
      for (let j = 0; j < 7; j++) {
        const wd = new Date(now - (i + j) * dayMs).toLocaleDateString();
        (dailyUsers[wd] || new Set()).forEach(u => wauSet.add(u));
      }
      const mauSet = new Set<string>();
      for (let j = 0; j < 30; j++) {
        const md = new Date(now - (i + j) * dayMs).toLocaleDateString();
        (dailyUsers[md] || new Set()).forEach(u => mauSet.add(u));
      }
      result.push({ date: dateStr, dau: daySet.size, wau: wauSet.size, mau: mauSet.size });
    }
    return result;
  }, [mergedEvents]);

  // ---- Activity Tiers ----
  const activityTiers = useMemo(() => {
    const tiers = { light: 0, medium: 0, heavy: 0 };
    for (const u of userStats) {
      const total = u.views + u.copies + u.gens;
      if (total <= 2) tiers.light++;
      else if (total <= 10) tiers.medium++;
      else tiers.heavy++;
    }
    return [
      { name: tq("Casual", "轻度"), value: tiers.light, color: "#7c8aa5" },
      { name: tq("Regular", "中度"), value: tiers.medium, color: "#5aab7a" },
      { name: tq("Power", "重度"), value: tiers.heavy, color: "#d4a843" },
    ];
  }, [userStats, lang]);

  // ---- Retention ----
  const retention = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const firstSeen: Record<string, number> = {};
    const activeDays: Record<string, Set<number>> = {};
    for (const e of mergedEvents) {
      if (!e.userId) continue;
      const dayTs = Math.floor(e.timestamp / dayMs);
      if (!firstSeen[e.userId] || e.timestamp < firstSeen[e.userId]) firstSeen[e.userId] = e.timestamp;
      if (!activeDays[e.userId]) activeDays[e.userId] = new Set();
      activeDays[e.userId].add(dayTs);
    }
    const todayDay = Math.floor(now / dayMs);
    let d1 = 0; let d7 = 0; let d30 = 0; let total = 0;
    for (const uid in firstSeen) {
      const firstDay = Math.floor(firstSeen[uid] / dayMs);
      const daysSinceFirst = todayDay - firstDay;
      if (daysSinceFirst < 1) continue;
      total++;
      if (activeDays[uid].has(firstDay + 1)) d1++;
      if (daysSinceFirst >= 7 && Array.from({length:7},(_,i)=>firstDay+i+1).some(d=>activeDays[uid].has(d))) d7++;
      if (daysSinceFirst >= 30 && Array.from({length:30},(_,i)=>firstDay+i+1).some(d=>activeDays[uid].has(d))) d30++;
    }
    return { d1: total > 0 ? Math.round(d1 / total * 100) : 0, d7: total > 0 ? Math.round(d7 / total * 100) : 0, d30: total > 0 ? Math.round(d30 / total * 100) : 0 };
  }, [mergedEvents, lang]);

  // ---- New vs Returning ----
  const newVsReturning = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const firstSeen: Record<string, number> = {};
    for (const e of mergedEvents) {
      if (!e.userId) continue;
      if (!firstSeen[e.userId] || e.timestamp < firstSeen[e.userId]) firstSeen[e.userId] = e.timestamp;
    }
    const result: { date: string; newUsers: number; returning: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      d.setHours(0,0,0,0);
      const dayStart = d.getTime();
      const dayEnd = dayStart + dayMs;
      const dayUsers = new Set<string>();
      for (const e of mergedEvents) {
        if (!e.userId) continue;
        if (e.timestamp >= dayStart && e.timestamp < dayEnd) dayUsers.add(e.userId);
      }
      let n = 0; let r = 0;
      for (const uid of dayUsers) {
        if (firstSeen[uid] >= dayStart && firstSeen[uid] < dayEnd) n++;
        else r++;
      }
      result.push({ date: d.toLocaleDateString(lang === "zh-CN" ? "zh-CN" : "en-US", {month:"short",day:"numeric"}), newUsers: n, returning: r });
    }
    return result;
  }, [mergedEvents, lang]);

  // ---- Hourly Heatmap ----
  const hourlyHeatmap = useMemo(() => {
    const hours = Array.from({length: 24}, (_, h) => ({ hour: h, count: 0 }));
    for (const e of mergedEvents) {
      const h = new Date(e.timestamp).getHours();
      hours[h].count++;
    }
    const max = Math.max(1, ...hours.map(h => h.count));
    return hours.map(h => ({ ...h, intensity: h.count / max }));
  }, [mergedEvents]);

  // ---- Conversion Funnel ----
  const conversionFunnel = useMemo(() => {
    const uniqueViewers = new Set<string>();
    const uniqueCopiers = new Set<string>();
    const uniqueGenerators = new Set<string>();
    for (const e of mergedEvents) {
      if (!e.userId) continue;
      if (e.type === "template_view") uniqueViewers.add(e.userId);
      if (e.type === "template_copy") uniqueCopiers.add(e.userId);
      if (e.type === "ai_generate") uniqueGenerators.add(e.userId);
    }
    const viewers = uniqueViewers.size;
    const copiers = uniqueCopiers.size;
    const generators = uniqueGenerators.size;
    return [
      { name: tq("Viewed", "浏览过"), value: viewers, pct: 100 },
      { name: tq("Copied", "复制过"), value: copiers, pct: viewers > 0 ? Math.round(copiers / viewers * 100) : 0 },
      { name: tq("AI Generated", "AI生成过"), value: generators, pct: viewers > 0 ? Math.round(generators / viewers * 100) : 0 },
    ];
  }, [mergedEvents, lang]);





  const totalViews = Object.values(filteredStats.views).reduce((a, b) => a + b, 0);
  const totalCopies = Object.values(filteredStats.copies).reduce((a, b) => a + b, 0);
  const hasData = filteredEvents.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-4">
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
      <div className="flex items-center gap-1 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg p-0.5 mb-6 mx-auto w-fit">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-sm' : 'text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>
          <BarChart3 size={14} />{tq('Overview', '概览')}
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-sm' : 'text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>
          <Users size={14} />{tq('Users', '用户分析')}
        </button>
        <button onClick={() => setActiveTab('content')} className={`flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] shadow-sm' : 'text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-text)]'}`}>
          <TrendingUp size={14} />{tq('Content', '内容分析')}
        </button>
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
          {activeTab === 'overview' && <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Eye} color="accent" value={totalViews} label={tq('Views', '查看')} />
            <StatCard icon={Copy} color="success" value={totalCopies} label={tq('Copies', '复制')} />
            <StatCard icon={Zap} color="warn" value={filteredStats.aiGen} label={tq('Generated', '生成')} />
            <StatCard icon={Star} color="warn" value={favorites.length} label={tq('Favorites', '收藏')} />
            <StatCard icon={ThumbsUp} color="success" value={feedbackTotal > 0 ? Math.round((thumbsUp / feedbackTotal) * 100) + '%' : '--'} label={tq('Helpful', '好评率')} />
          </div>

          </>}
          {activeTab === 'users' && <>
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
                    {provider === 'github' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-bench-text)] opacity-70"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    ) : provider === 'google' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-bench-text)] opacity-70"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-bench-muted)]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    )}
                    <span className="text-sm font-semibold text-[var(--color-bench-text)]">{count}</span>
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
          

          <SectionHeader icon={Users} title={tq("User Analytics", "用户分析")} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ChartCard title={tq("Retention", "留存率")} icon={Activity}>
              <div className="flex justify-between py-2">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-[var(--color-bench-accent)] font-[var(--font-display)]">{retention.d1}%</div>
                  <div className="text-xs text-[var(--color-bench-muted)] mt-1">D1</div>
                </div>
                <div className="w-px bg-[var(--color-bench-border)]" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-[var(--color-bench-success)] font-[var(--font-display)]">{retention.d7}%</div>
                  <div className="text-xs text-[var(--color-bench-muted)] mt-1">D7</div>
                </div>
                <div className="w-px bg-[var(--color-bench-border)]" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-[var(--color-bench-warn)] font-[var(--font-display)]">{retention.d30}%</div>
                  <div className="text-xs text-[var(--color-bench-muted)] mt-1">D30</div>
                </div>
              </div>
            </ChartCard>
            <ChartCard title={tq("Activity Tiers", "活跃分层")} icon={Layers}>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={activityTiers} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25} stroke="none">
                    {activityTiers.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-bench-surface-solid)", border: "1px solid var(--color-bench-border)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "var(--color-bench-text)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {activityTiers.map(t => (<div key={t.name} className="flex items-center gap-1.5 text-xs text-[var(--color-bench-muted)]"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />{t.name} {t.value}</div>))}
              </div>
            </ChartCard>
            <ChartCard title={tq("Conversion Funnel", "转化漏斗")} icon={TrendingUp}>
              <div className="space-y-3 py-1">
                {conversionFunnel.map((step, i) => (
                  <div key={step.name}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-[var(--color-bench-text-dim)]">{step.name}</span><span className="text-[var(--color-bench-muted)]">{step.value} ({step.pct}%)</span></div>
                    <div className="w-full h-2 bg-[var(--color-bench-border)]/30 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: step.pct + "%", background: ["#d4a843", "#5aab7a", "#7c8aa5"][i] }} /></div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <ChartCard title={tq("DAU / WAU / MAU", "日活 / 周活 / 月活")} icon={Users}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dauWauMau.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bench-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-bench-muted)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-bench-muted)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ background: "var(--color-bench-surface-solid)", border: "1px solid var(--color-bench-border)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "var(--color-bench-text)" }} />
                  <Line type="monotone" dataKey="dau" stroke="#d4a843" strokeWidth={2} dot={false} name={tq("DAU", "日活")} />
                  <Line type="monotone" dataKey="wau" stroke="#5aab7a" strokeWidth={2} dot={false} name={tq("WAU", "周活")} />
                  <Line type="monotone" dataKey="mau" stroke="#7c8aa5" strokeWidth={2} dot={false} name={tq("MAU", "月活")} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title={tq("New vs Returning", "新用户 vs 回访")} icon={UserPlus}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={newVsReturning} barGap={0} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bench-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-bench-muted)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-bench-muted)" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={{ background: "var(--color-bench-surface-solid)", border: "1px solid var(--color-bench-border)", borderRadius: "0.75rem", fontSize: "0.75rem", color: "var(--color-bench-text)" }} />
                  <Bar dataKey="newUsers" stackId="a" fill="#d4a843" radius={[4, 4, 0, 0]} name={tq("New", "新用户")} />
                  <Bar dataKey="returning" stackId="a" fill="#5aab7a" radius={[0, 0, 0, 0]} name={tq("Returning", "回访")} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title={tq("Hourly Activity", "时段活跃度")} icon={Clock} className="mb-8">
            <div className="flex gap-0.5">
              {hourlyHeatmap.map(h => (
                <div key={h.hour} className="flex-1 h-8 rounded min-w-[4px]" style={{ background: `rgba(212,168,67,${h.intensity.toFixed(2)})` }} title={h.hour + ":00 - " + h.count} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-[var(--color-bench-muted)] mt-1.5">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
            </div>
          </ChartCard>


            </>}

            {activeTab === 'content' && <>
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
          </>}

          {activeTab === 'overview' && <>
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
          </>}
        </>
      )}
    </div>
  );
}


function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-2">
      <div className="w-1 h-5 rounded-full bg-[var(--color-bench-accent)]" />
      <Icon size={15} className="text-[var(--color-bench-accent)]" />
      <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{title}</h3>
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
