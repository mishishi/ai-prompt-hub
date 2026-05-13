import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { templates } from '../../data/templates';

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Cmd/Ctrl + K: go to library with search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/library?focus=search');
        return;
      }

      // Escape: go back
      if (e.key === 'Escape') {
        if (location.pathname.startsWith('/template/')) navigate('/library');
        else if (location.pathname === '/generate') navigate('/');
        else if (location.pathname === '/library') navigate('/');
        return;
      }

      // Left/Right arrows on template detail
      if (location.pathname.startsWith('/template/')) {
        const currentId = location.pathname.split('/').pop();
        if (currentId) {
          // Find index of current template
          const idx = templates.findIndex(t => t.id === currentId);
          if (e.key === 'ArrowRight' && idx >= 0 && idx < templates.length - 1) {
            e.preventDefault();
            navigate('/template/' + templates[idx + 1].id);
          } else if (e.key === 'ArrowLeft' && idx > 0) {
            e.preventDefault();
            navigate('/template/' + templates[idx - 1].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, location]);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bench-bg)]">
      <TopNavbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
