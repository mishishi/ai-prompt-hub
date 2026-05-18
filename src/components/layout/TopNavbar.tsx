import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Globe, Sun, Moon, Menu, X } from 'lucide-react';
import { useT } from '../../i18n/LanguageContext';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useTheme } from '../../i18n/ThemeContext';

export function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useT();
  const { theme, toggle } = useTheme();
  const { isLoaded, isSignedIn } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [switchAnim, setSwitchAnim] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setShowAuth(true), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // mobileMenu auto-closes on navigation via derived state and click handler

  const navLinks = [
    { path: '/', label: tq('Home', '首页') },
    { path: '/library', label: tq('Templates', '模板') },
    { path: '/generate', label: tq('Generate', 'AI 生成') },
    { path: '/prompts', label: tq('My Prompts', '我的 Prompt') },
    { path: '/dashboard', label: tq('Track', '效果') },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' :
    path === '/library' ? (location.pathname.startsWith(path) || location.pathname.startsWith('/template/')) :
    location.pathname.startsWith(path);

  return (
    <>
      <header className="h-14 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-surface-solid)] flex items-center px-4 md:px-5 gap-2 md:gap-4 flex-shrink-0 z-20 relative">
        {/* Logo */}
        <div onClick={() => navigate('/')} className="flex items-center gap-2 md:gap-2.5 cursor-pointer flex-shrink-0 group">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--color-bench-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-bench-accent)]/20 group-hover:shadow-[var(--color-bench-accent)]/40 transition-shadow">
            <Sparkles size={14} className="md:size-[16px] text-white" />
          </div>
          <span className="text-sm font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight hidden sm:inline">PromptBench</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 sm:px-3.5 ${
                isActive(link.path)
                  ? 'bg-[var(--color-bench-accent)]/20 text-[var(--color-bench-accent)] font-semibold shadow-[0_0_12px_var(--color-bench-accent-glow)]'
                  : 'text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Theme toggle */}
        <button onClick={toggle} className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-2.5 md:py-1.5 rounded-lg text-sm text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)] transition-all duration-200 cursor-pointer flex-shrink-0" title={tq('Switch theme', '切换主题')} aria-label={tq('Switch theme', '切换主题')}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Auth crossfade */}
        <div className="relative w-7 h-7 flex-shrink-0">
          <div className={`absolute inset-0 transition-opacity duration-500 ${!showAuth ? "opacity-100 animate-pulse" : "opacity-0 pointer-events-none"}`}>
            <div className="w-7 h-7 rounded-full bg-[var(--color-bench-accent)]/25" />
          </div>
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${showAuth ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 -ml-1 rounded-lg text-sm font-medium text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)] transition-all duration-200 cursor-pointer whitespace-nowrap">
                  <span className="hidden sm:inline">{tq("Sign In", "登录")}</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Language toggle */}
        <button aria-label={tq('Switch language', '切换语言')} onClick={() => { setLang(lang === 'zh-CN' ? 'en' : 'zh-CN'); setSwitchAnim(true); setTimeout(() => setSwitchAnim(false), 300); }} className={"flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-2.5 md:py-1.5 rounded-lg text-sm text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)] transition-all duration-200 cursor-pointer flex-shrink-0 " + (switchAnim ? "scale-110" : "")}>
          <Globe size={14} />
          <span className="hidden md:inline text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--color-bench-accent)]/25 text-[var(--color-bench-accent)] ml-1.5">{lang === 'zh-CN' ? '中文' : 'EN'}</span>
        </button>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileMenu(!mobileMenu)} aria-label={tq('Menu', '菜单')} className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)] transition-all duration-200 flex-shrink-0">
          {mobileMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenu && (
        <div className="md:hidden fixed inset-0 top-14 z-10 bg-[var(--color-bench-bg)]/95 backdrop-blur-sm">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileMenu(false); }}
                className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-[var(--color-bench-accent)]/15 text-[var(--color-bench-accent)] font-semibold'
                    : 'text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
