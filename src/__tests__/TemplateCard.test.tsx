import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TemplateCard } from '../components/templates/TemplateCard';
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

function renderCard(overrides: any = {}) {
  const template: any = {
    id: 'test-1',
    meta: {
      name: 'Test Template',
      nameZh: '测试模板',
      description: 'A test template',
      descriptionZh: '测试模板描述',
      tags: ['backend'],
      platform: 'claude',
    },
    variables: [],
    system: { role: 'You are a helpful assistant' },
    user: 'Write a function',
    category: ['backend'],
    difficulty: 'Beginner',
    mode: 'guide',
    _community: false,
    _verified: 0,
    ...overrides,
  };

  return render(
    <MemoryRouter>
      <ToastProvider>
        <LanguageProvider>
          <TemplateCard
            template={template}
            score={5}
            copyCount={10}
            onClick={() => {}}
            onCopy={() => {}}
          />
        </LanguageProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('TemplateCard', () => {
  it('renders without crashing', () => {
    const { container } = renderCard();
    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('shows verified badge when _verified is truthy', () => {
    const { container } = renderCard({ _verified: 1 });
    expect(container.textContent).toMatch(/Verified|已验证/);
  });

  it('shows author name for community template', () => {
    const { container } = renderCard({ _community: true, _authorName: 'Alice' });
    expect(container.textContent).toContain('Alice');
  });

  it('shows copy count in container', () => {
    const { container } = renderCard();
    expect(container.textContent).toContain('10');
  });

  it('renders interactive buttons', () => {
    const { container } = renderCard();
    expect(container.textContent).toMatch(/Copy|复制/);
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});