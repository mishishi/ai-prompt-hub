import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Eye, Copy, Zap, ThumbsUp, ThumbsDown, TrendingUp, } from 'lucide-react';
import { getStats, getEvents } from '../../utils/analytics';
import { templates } from '../../data/templates';
import { tName } from '../../data/templates/helper';
import type { AnalyticsEvent } from '../../utils/analytics';
import { useT } from '../../i18n/LanguageContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRefreshKey(k => k + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => getStats(), [refreshKey]);
  const events: AnalyticsEvent[] = useMemo(() => getEvents(), [refreshKey]);

  const feedbackData = useMemo(() => {
    try {
      const raw = localStorage.getItem('promptbench-feedback');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, [refreshKey]);
  const thumbsUp = feedbackData.filter((f: any) => f.value === 'up').length;
  const thumbsDown = feedbackData.filter((f: any) => f.value === 'down').length;
  const feedbackTotal = thumbsUp + thumbsDown;

  const topByViews = useMemo(() => {
    return Object.entries(stats.views)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stats.views]);

  const topByConversion = useMemo(() => {
    return Object.entries(stats.conversion)
      .filter(([, v]) => v !== '0%')
      .sort(([, a], [, b]) => parseFloat(b) - parseFloat(a))
      .slice(0, 5);
  }, [stats.conversion]);

  const recentEvents = useMemo(() => {
    return events.slice(-10).reverse();
  }, [events]);

  const templateName = (id: string) => {
    const tmpl = templates.find(t => t.id === id);
    return tmpl ? tName(tmpl, lang) : id.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  };
  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return tq(s + 's ago', s + ' 秒前');
    if (s < 3600) return tq(Math.floor(s / 60) + 'm ago', Math.floor(s / 60) + ' 分钟前');
    return tq(Math.floor(s / 3600) + 'h ago', Math.floor(s / 3600) + ' 小时前');
  };

  const isEmpty = stats.total === 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bench-accent)]/10 flex items-center justify-center">
          <BarChart3 size={20} className="text-[var(--color-bench-accent)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">
            {tq('Effect Tracking', '效果追踪')}
          </h2>
          <p className="text-sm text-[var(--color-bench-text-dim)]">
            {tq('See how your prompts perform', '查看你的 Prompt 使用效果')}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-[var(--color-bench-muted)]" />
          </div>
          <p className="text-base text-[var(--color-bench-text-dim)] mb-1">
            {tq('No data yet', '暂无数据')}
          </p>
          <p className="text-sm text-[var(--color-bench-muted)] mb-6">
            {tq('Use templates and the AI generator to start tracking', '使用模板和 AI 生成器后这里会出现数据')}
          </p>
          <button onClick={() => navigate('/library')} className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium">
            <Eye size={14} />
            {tq('Browse Templates', '浏览模板')}
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-5">
              <div className="flex items-center gap-2 text-[var(--color-bench-muted)] text-xs mb-2">
                <Eye size={14} />
                {tq('Template Views', '模板查看')}
              </div>
              <div className="text-3xl font-bold text-[var(--color-bench-accent)] font-[var(--font-display)]">
                {Object.values(stats.views).reduce((a, b) => a + b, 0)}
              </div>
            </div>
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-5">
              <div className="flex items-center gap-2 text-[var(--color-bench-muted)] text-xs mb-2">
                <Copy size={14} />
                {tq('Copies', '复制次数')}
              </div>
              <div className="text-3xl font-bold text-[var(--color-bench-success)] font-[var(--font-display)]">
                {Object.values(stats.copies).reduce((a, b) => a + b, 0)}
              </div>
            </div>
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-5">
              <div className="flex items-center gap-2 text-[var(--color-bench-muted)] text-xs mb-2">
                <Zap size={14} />
                {tq('AI Generated', 'AI 生成')}
              </div>
              <div className="text-3xl font-bold text-[var(--color-bench-accent-secondary)] font-[var(--font-display)]">
                {stats.aiGen}
              </div>
            </div>
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl p-5">
              <div className="flex items-center gap-2 text-[var(--color-bench-muted)] text-xs mb-2">
                <TrendingUp size={14} />
                {tq('Satisfaction', '满意度')}
              </div>
              <div className="text-3xl font-bold text-[var(--color-bench-warn)] font-[var(--font-display)]">
                {feedbackTotal > 0 ? Math.round((thumbsUp / feedbackTotal) * 100) + '%' : '--'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Viewed */}
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">
                  {tq('Most Viewed Templates', '最常查看的模板')}
                </h3>
              </div>
              <div className="p-4">
                {topByViews.length === 0 ? (
                  <p className="text-xs text-[var(--color-bench-muted)] py-4 text-center">{tq('No views yet', '暂无查看记录')}</p>
                ) : (
                  topByViews.map(([id, count]) => (
                    <div key={id} className="flex items-center justify-between py-2 border-b border-[var(--color-bench-border)]/50 last:border-0">
                      <button onClick={() => navigate('/template/' + id)} className="text-sm text-[var(--color-bench-text)] hover:text-[var(--color-bench-accent)] transition-colors text-left">{templateName(id)}</button>
                      <span className="text-xs text-[var(--color-bench-muted)]">{count} {tq('views', '次')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Conversion */}
            <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">
                  {tq('Best Conversion Rate', '最佳转化率')}
                </h3>
              </div>
              <div className="p-4">
                {topByConversion.length === 0 ? (
                  <p className="text-xs text-[var(--color-bench-muted)] py-4 text-center">{tq('No copies yet', '暂无复制记录')}</p>
                ) : (
                  topByConversion.map(([id, rate]) => (
                    <div key={id} className="flex items-center justify-between py-2 border-b border-[var(--color-bench-border)]/50 last:border-0">
                      <button onClick={() => navigate('/template/' + id)} className="text-sm text-[var(--color-bench-text)] hover:text-[var(--color-bench-accent)] transition-colors text-left">{templateName(id)}</button>
                      <span className="text-xs font-medium text-[var(--color-bench-success)]">{rate}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {feedbackTotal > 0 && (
            <div className="mt-6 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">
                  {tq('AI Prompt Feedback', 'AI 生成反馈')}
                </h3>
              </div>
              <div className="p-5 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bench-success)]/10 flex items-center justify-center">
                    <ThumbsUp size={20} className="text-[var(--color-bench-success)]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-bench-success)] font-[var(--font-display)]">{thumbsUp}</div>
                    <div className="text-xs text-[var(--color-bench-muted)]">{tq('Helpful', '有帮助')}</div>
                  </div>
                </div>
                <div className="w-px h-12 bg-[var(--color-bench-border)]" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bench-error)]/10 flex items-center justify-center">
                    <ThumbsDown size={20} className="text-[var(--color-bench-error)]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-bench-error)] font-[var(--font-display)]">{thumbsDown}</div>
                    <div className="text-xs text-[var(--color-bench-muted)]">{tq('Not Helpful', '没帮助')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentEvents.length > 0 && (
            <div className="mt-6 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">
                  {tq('Recent Activity', '最近动态')}
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {recentEvents.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    {e.type === 'template_view' ? <Eye size={12} className="text-[var(--color-bench-accent)] flex-shrink-0" /> : e.type === 'template_copy' ? <Copy size={12} className="text-[var(--color-bench-success)] flex-shrink-0" /> : e.type === 'ai_generate' ? <Zap size={12} className="text-[var(--color-bench-accent)] flex-shrink-0" /> : e.type === 'ai_copy' ? <Copy size={12} className="text-[var(--color-bench-success)] flex-shrink-0" /> : <ThumbsUp size={12} className="text-[var(--color-bench-warn)] flex-shrink-0" />}
                    <span className="text-[var(--color-bench-muted)]">
                      {e.type === 'template_view' && tq('Viewed', '查看了') + ' ' + templateName(e.templateId || '')}
                      {e.type === 'template_copy' && tq('Copied', '复制了') + ' ' + templateName(e.templateId || '')}
                      {e.type === 'ai_generate' && tq('Generated a prompt', '生成了一个 Prompt')}
                      {e.type === 'ai_copy' && tq('Copied AI result', '复制了 AI 结果')}
                      {e.type === 'ai_feedback' && tq('Left feedback', '留下了反馈')}
                    </span>
                    <span className="text-[var(--color-bench-muted)]/50">{timeAgo(e.timestamp)}</span>
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