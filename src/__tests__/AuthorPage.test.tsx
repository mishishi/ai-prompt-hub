import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthorPage } from '../components/templates/AuthorPage';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ToastProvider } from '../components/ui/Toast';

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: null }),
}));

vi.mock('../utils/analytics', () => ({
  track: vi.fn(),
  getDisplayName: () => 'test',
}));

vi.mock('../utils/storage', () => ({
  isFavorite: () => false,
  toggleFavorite: () => false,
}));

vi.mock('../utils/clipboard', () => ({
  copyToClipboard: vi.fn(),
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ authorId: 'author-1' }),
  };
});

describe('AuthorPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading skeleton initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    const { container } = render(
      <MemoryRouter>
        <ToastProvider>
          <LanguageProvider>
            <AuthorPage />
          </LanguageProvider>
        </ToastProvider>
      </MemoryRouter>
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders author name and template count', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          ok: true,
          templates: [
            { id: 't1', authorId: 'author-1', authorName: 'Alice', name: 'Template A', description: '', tags: [], category: 'backend', difficulty: 'Beginner', prompt: 'test', likes: 5, copies: 10, createdAt: new Date().toISOString() },
            { id: 't2', authorId: 'author-1', authorName: 'Alice', name: 'Template B', description: '', tags: [], category: 'frontend', difficulty: 'Intermediate', prompt: 'test', likes: 3, copies: 7, createdAt: new Date().toISOString() },
          ],
        }),
      })
    ) ;

    const { container } = render(
      <MemoryRouter>
        <ToastProvider>
          <LanguageProvider>
            <AuthorPage />
          </LanguageProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Alice');
      expect(container.textContent).toContain('Template A');
      expect(container.textContent).toContain('Template B');
    });
  });

  it('shows empty state when no templates', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ ok: true, templates: [] }) })
    ) ;

    const { container } = render(
      <MemoryRouter>
        <ToastProvider>
          <LanguageProvider>
            <AuthorPage />
          </LanguageProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.textContent).toMatch(/暂无|no template/i);
    });
  });
});