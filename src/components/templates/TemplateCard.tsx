import { useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import type { LibraryTemplate } from '../../types';
import { useT } from '../../i18n/LanguageContext';
import { tName, tShort } from '../../data/templates/helper';
import { copyToClipboard } from '../../utils/clipboard';
import { getPlatformLabel } from '../../utils/platform';

export function TemplateCard({ template, onClick }: { template: LibraryTemplate; onClick: () => void }) {
  const { t, lang } = useT();
  const [copied, setCopied] = useState(false);
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
  };

  const diffColors: Record<string, string> = {
    Beginner: 'text-[var(--color-difficulty-beginner)]',
    Intermediate: 'text-[var(--color-difficulty-intermediate)]',
    Advanced: 'text-[var(--color-difficulty-advanced)]',
  };

  return (
    <article className="glass-card group relative flex flex-col p-5 h-full overflow-hidden cursor-pointer">
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[var(--color-bench-accent)]/5 via-transparent to-[var(--color-bench-accent-secondary)]/5" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-[var(--color-bench-accent-secondary)]/10 text-[var(--color-bench-accent-secondary)]">
            {getPlatformLabel(platform, lang)}
          </span>
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${diffColors[template.difficulty] || diffColors.Intermediate} bg-white/5`}>
            {t('difficulty.' + template.difficulty)}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-[15px] font-semibold text-[var(--color-bench-text)] mb-2 leading-snug font-[var(--font-display)]">
          {tName(template, lang)}
        </h3>
        <p className="text-[13px] text-[var(--color-bench-text-dim)] leading-relaxed line-clamp-2 flex-1">
          {tShort(template, lang)}
        </p>

        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-bench-accent-secondary)]/10 text-[var(--color-bench-accent-secondary)]`}>{template.mode ? t("mode." + template.mode) : ""}</span>
        
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-bench-border)] group-hover:border-[var(--color-bench-accent)]/30 transition-colors">
          <span className="text-[11px] font-medium text-[var(--color-bench-muted)] uppercase tracking-wider">
            {t('category.' + template.category[0])}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 transition-colors"><Eye size={11} />{t('card.preview')}</button>
            <button onClick={handleCopy} className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${copied ? 'text-[var(--color-bench-success)]' : 'text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)]'}`}>
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? t('card.copied') : t('card.copy')}
          </button>
          </div>
        </div>
      </div>

    </article>
  );
}