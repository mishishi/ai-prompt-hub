import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useT } from '../../../i18n/LanguageContext';

export function NotFound() {
  const navigate = useNavigate();
  const { lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;

  return (
    <div className="flex items-center justify-center min-h-[70vh] page-enter">
      <div className="text-center px-6">
        <div className="w-20 h-20 rounded-2xl border border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={32} className="text-[var(--color-bench-muted)]" />
        </div>
        <h1 className="text-6xl font-extrabold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight mb-3">404</h1>
        <p className="text-lg text-[var(--color-bench-text-dim)] mb-2">
          {tq('Page not found', '页面未找到')}
        </p>
        <p className="text-base text-[var(--color-bench-muted)] mb-8 max-w-md mx-auto">
          {tq('The page you are looking for does not exist or has been moved.', '你访问的页面不存在或已被移动。')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium">
            <ArrowLeft size={14} />
            {tq('Go Back', '返回上页')}
          </button>
          <button onClick={() => navigate('/')} className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium">
            <Home size={14} />
            {tq('Home', '首页')}
          </button>
        </div>
      </div>
    </div>
  );
}
