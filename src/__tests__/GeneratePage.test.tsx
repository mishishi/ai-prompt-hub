import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GeneratePage } from '../components/workspace/GeneratePage';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ToastProvider } from '../components/ui/Toast';

vi.mock('@clerk/clerk-react', () => ({ useUser: () => ({ user: null }) }));
vi.mock('../utils/analytics', () => ({ track: vi.fn(), getDisplayName: () => 'test' }));

describe('GeneratePage', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <ToastProvider>
            <GeneratePage />
          </ToastProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('shows input form', () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <ToastProvider>
            <GeneratePage />
          </ToastProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });
});