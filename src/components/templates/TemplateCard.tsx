import { useState } from 'react';
import { Copy, Check, Star, BadgeCheck } from 'lucide-react';
import type { LibraryTemplate } from '../../types';
import { useT } from '../../i18n/LanguageContext';
import { tName, tShort } from '../../data/templates/helper';
import { copyToClipboard } from '../../utils/clipboard';
import { track } from '../../utils/analytics';
import { toggleFavorite, isFavorite } from '../../utils/storage';
import { useToast } from '../ui/Toast';
import { getPlatformLabel } from '../../utils/platform';

export function TemplateCard({ template, onClick, score = 0, copyCount = 0, onCopy }: { template: LibraryTemplate; onClick: () => void; score?: number; copyCount?: number; onCopy?: () => void }) {
  const { t, lang } = useT();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [fav, setFav] = useState(() => isFavorite(template.id));
  const platform = template.meta.platform;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaults: Record<string, string | boolean> = {};
    template.variables.forEach(v => { if (v.default !== undefined) defaults[v.name] = v.default; });
    let text = (lang === 'zh-CN' && template.userZh) ? template.userZh : template.user;
    template.variables.forEach(v => {
      const val = defaults[v.name] ?? v.default;
      if (val !== undefined && val !== null) text = text.replace(new RegExp('{{' + v.name + '}}', 'g'), String(val));
    });
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.show(t('card.copied'));
    track({ type: 'template_copy', templateId: template.id, lang });
    onCopy?.();
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleFavorite(template.id);
    setFav(now);
    toast.show(t(now ? 'card.favorited' : 'card.favorite'));
  };

  const diffColors: Record<string, string> = {
    Beginner: 'text-[var(--color-difficulty-beginner)]',
    Intermediate: 'text-[var(--color-difficulty-intermediate)]',
    Advanced: 'text-[var(--color-difficulty-advanced)]',
  };

  return (
    <article onClick={onClick} className="glass-card group relative flex flex-col p-5 h-full overflow-hidden cursor-pointer">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[var(--color-bench-accent)]/5 via-transparent to-[var(--color-bench-accent-secondary)]/5" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-semibold uppercase tracking-wider bg-[var(--color-bench-accent-secondary)]/10 text-[var(--color-bench-accent-secondary)]">
            {getPlatformLabel(platform, lang)}
          </span>
          {template.verified && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)]">
              <BadgeCheck size={11} />
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {score > 0 && (
              <span className={"text-sm font-semibold px-1.5 py-0.5 rounded bg-white/5 " + (score >= 60 ? 'text-[var(--color-bench-success)]' : score >= 30 ? 'text-[var(--color-bench-warn)]' : 'text-[var(--color-bench-muted)]')}>
                {lang === 'zh-CN' ? score + '分' : score + 'pts'}
              </span>
            )}
            <span className={"text-sm font-semibold px-1.5 py-0.5 rounded " + (diffColors[template.difficulty] || diffColors.Intermediate) + " bg-white/5"}>
              {t('difficulty.' + template.difficulty)}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-[var(--color-bench-text)] mb-2 leading-snug font-[var(--font-display)]">
          {tName(template, lang)}
        </h3>
        <p className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed line-clamp-2 flex-1">
          {tShort(template, lang)}
        </p>

        <span className={"text-sm font-semibold px-1.5 py-0.5 rounded bg-[var(--color-bench-accent-secondary)]/10 text-[var(--color-bench-accent-secondary)]"}>{template.mode && t('mode.' + template.mode)}</span>
        
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[var(--color-bench-border)] group-hover:border-[var(--color-bench-accent)]/30 transition-colors">
          <button onClick={handleFavorite} className={"flex items-center gap-1 text-sm font-medium transition-colors " + (fav ? 'text-[var(--color-bench-warn)]' : 'text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-warn)]')}>
            <Star size={12} fill={fav ? 'currentColor' : 'none'} />
            {t(fav ? 'card.favorited' : 'card.favorite')}
          </button>
          <button onClick={handleCopy} className={"flex items-center gap-1 text-sm font-medium transition-colors " + (copied ? 'text-[var(--color-bench-success)]' : 'text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)]')}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? t('card.copied') : t('card.copy')}
          </button>
          {copyCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bench-accent)]/8 text-[var(--color-bench-accent)]">
              <Copy size={10} />
              {t('card.copies').replace('{n}', String(copyCount))}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}