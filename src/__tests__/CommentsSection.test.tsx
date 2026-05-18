import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CommentsSection } from '../components/templates/CommentsSection';
import { LanguageProvider } from '../i18n/LanguageContext';

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      id: 'user-1',
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@test.com' },
    },
  }),
}));

describe('CommentsSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // never resolves
    const { container } = render(
      <LanguageProvider>
        <CommentsSection templateId="tpl-1" />
      </LanguageProvider>
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state when no comments', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ ok: true, comments: [] }) })
    ) ;

    const { container } = render(
      <LanguageProvider>
        <CommentsSection templateId="tpl-1" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(container.textContent).toMatch(/暂无评论|No comments/);
    });
  });

  it('renders comment list', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          ok: true,
          comments: [
            { id: 'c1', userId: 'u1', userName: 'Alice', content: 'Great prompt!', createdAt: new Date().toISOString() },
            { id: 'c2', userId: 'u2', userName: 'Bob', content: 'Very useful', createdAt: new Date().toISOString() },
          ],
        }),
      })
    ) ;

    const { container } = render(
      <LanguageProvider>
        <CommentsSection templateId="tpl-1" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Alice');
      expect(container.textContent).toContain('Bob');
      expect(container.textContent).toContain('Great prompt!');
    });
  });

  it('shows input for logged-in users', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ ok: true, comments: [] }) })
    ) ;

    render(
      <LanguageProvider>
        <CommentsSection templateId="tpl-1" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/写评论|Write/)).toBeInTheDocument();
    });
  });

  it('formats date correctly', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          ok: true,
          comments: [{ id: 'c1', userId: 'u1', userName: 'Alice', content: 'Test', createdAt: new Date().toISOString() }],
        }),
      })
    ) ;

    const { container } = render(
      <LanguageProvider>
        <CommentsSection templateId="tpl-1" />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(container.textContent).toMatch(/刚刚|just now|分钟前|m ago/);
    });
  });
});