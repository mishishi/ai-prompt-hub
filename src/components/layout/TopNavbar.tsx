import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Globe } from 'lucide-react';
import { useT } from '../../i18n/LanguageContext';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  const navLinks = [
    { path: '/', label: tq('Home', '首页') },
    { path: '/library', label: tq('Templates', '模板') },
    { path: '/generate', label: tq('Generate', 'AI 生成') },
    { path: '/dashboard', label: tq('Track', '效果') },
  ];

  return (
    <header className="h-14 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-surface-solid)] flex items-center px-5 gap-4 flex-shrink-0 z-10">
      <div onClick={() => navigate('/')} className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-bench-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-bench-accent)]/20 group-hover:shadow-[var(--color-bench-accent)]/40 transition-shadow">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-base font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">PromptBench</span>
      </div>

      <nav className="flex items-center gap-1">
        {navLinks.map((link) => {
          const active = link.path === '/' ? location.pathname === '/' : link.path === '/library' ? (location.pathname.startsWith(link.path) || location.pathname.startsWith('/template/')) : location.pathname.startsWith(link.path);
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-[var(--color-bench-accent)]/20 text-[var(--color-bench-accent)] font-semibold shadow-[0_0_12px_var(--color-bench-accent-glow)]'
                  : 'text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)]'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />


      <button onClick={() => setLang(lang === 'zh-CN' ? 'en' : 'zh-CN')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)] transition-colors cursor-pointer">
        <Globe size={14} />
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--color-bench-accent)]/25 text-[var(--color-bench-accent)]">{lang === 'zh-CN' ? '中文' : 'EN'}</span>
      </button>
    </header>
  );
}