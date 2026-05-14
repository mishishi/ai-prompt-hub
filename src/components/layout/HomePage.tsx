import { useNavigate } from 'react-router-dom';
import { Sparkles, Star, ArrowRight, Zap, Code2 } from 'lucide-react';
import { templates } from '../../data/templates';
import { TemplateCard } from '../templates/TemplateCard';
import { useT } from '../../i18n/LanguageContext';

export function HomePage() {
  const navigate = useNavigate();
  const { lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  const recommended = templates.slice(0, 8);

  return (
    <div className="page-enter">
      <section className="relative overflow-hidden border-b border-[var(--color-bench-border)]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-bench-accent)]/20 to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-bench-accent)]/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[var(--color-bench-accent)]/20 bg-[var(--color-bench-accent)]/5 text-xs font-medium text-[var(--color-bench-accent)] mb-2">
                <Sparkles size={12} />
                {tq('Free & Open Source', '开源 · 免费使用')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-bench-text)] font-[var(--font-display)] leading-tight tracking-tight">
                {lang === 'zh-CN'
                  ? <><span className="text-[var(--color-bench-accent)]">像写代码一样</span>写 Prompt</>
                  : <><span className="text-[var(--color-bench-accent)]">Craft</span> prompts like code</>
                }
              </h1>
              <p className="text-lg text-[var(--color-bench-text-dim)] max-w-md leading-relaxed">
                {tq(
                  'Structured prompt templates for the full development lifecycle. AI-assisted generation, one-click copy. Free & open source.',
                  '覆盖全开发周期的结构化 Prompt 模板。AI 辅助生成，一键复制使用。免费开源。'
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button onClick={() => navigate('/generate')} className="btn-glow flex items-center gap-2 px-6 py-3 text-base">
                  <Zap size={18} />
                  {tq('Generate Your Prompt', '生成你的 Prompt')}
                </button>
                <button onClick={() => navigate('/library')} className="btn-ghost flex items-center gap-2 px-6 py-3 text-sm font-medium">
                  {tq('Browse Library', '浏览模板库')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-2xl bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)]" />
                <div className="absolute inset-4 rounded-2xl bg-[var(--color-bench-surface-solid)] border border-[var(--color-bench-border)] flex flex-col p-5 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-3/4 rounded bg-[var(--color-bench-accent)]/20" />
                    <div className="h-2 w-1/2 rounded bg-[var(--color-bench-accent)]/10" />
                    <div className="h-2 w-2/3 rounded bg-[var(--color-bench-accent)]/10" />
                    <div className="h-2 w-5/6 rounded bg-[var(--color-bench-accent)]/5" />
                    <div className="h-2 w-1/3 rounded bg-[var(--color-bench-accent)]/20" />
                    <div className="h-2 w-3/5 rounded bg-[var(--color-bench-accent)]/10" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-xl bg-[var(--color-bench-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-bench-accent)]/20">
                  <Code2 size={32} className="text-white" />
                </div>
              </div>
            </div>
          
            {/* Mobile-only simplified illustration */}
            <div className="flex lg:hidden items-center justify-center pt-6">
              <div className="relative w-56 h-40">
                <div className="absolute inset-0 rounded-xl bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)]" />
                <div className="absolute inset-3 rounded-xl bg-[var(--color-bench-surface-solid)] border border-[var(--color-bench-border)] flex flex-col p-3 gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400/60" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                    <div className="w-2 h-2 rounded-full bg-green-400/60" />
                  </div>
                  <div className="h-1.5 w-3/4 rounded bg-[var(--color-bench-accent)]/20" />
                  <div className="h-1.5 w-1/2 rounded bg-[var(--color-bench-accent)]/10" />
                  <div className="h-1.5 w-2/3 rounded bg-[var(--color-bench-accent)]/10" />
                </div>
              </div>
            </div></div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-[var(--color-bench-accent)]/20 flex items-center justify-center">
              <Star size={16} className="text-[var(--color-bench-accent)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">
              {tq('Recommended Templates', '推荐模板')}
            </h2>
          </div>
          <button onClick={() => navigate('/library')} className="flex items-center gap-1 text-sm text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] transition-colors group">
            <span className='group-hover:translate-x-0.5 transition-transform inline-block'>{tq('View all', '查看全部')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended.map((tmpl, i) => (
            <div key={tmpl.id} className={`card-enter stagger-${i + 1}`}>
              <TemplateCard template={tmpl} onClick={() => navigate(`/template/${tmpl.id}`)} />
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--color-bench-border)] py-8 text-center bg-[var(--color-bench-elevated)]/50">
        <p className="text-sm text-[var(--color-bench-muted)]">
          PromptBench · {tq('Free & Open Source', '开源 · 免费使用')}
        </p>
      </footer>
    </div>
  );
}
