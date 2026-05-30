import { Suspense, lazy } from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './i18n/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/layout/Layout';
import { PromptsPage } from './components/prompts/PromptsPage';
import { HomePage } from './components/layout/HomePage';
import { TemplateBrowser } from './components/templates/TemplateBrowser';
import { TemplateDetail } from './components/templates/TemplateDetail';
const GeneratePage = lazy(() => import('./components/workspace/GeneratePage').then(m => ({ default: m.GeneratePage })));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
import { NotFound } from './components/layout/errors/NotFound';
import { AuthorPage } from './components/templates/AuthorPage';
import { OnboardingGuide } from './components/layout/onboarding/OnboardingGuide';
import { ShortcutPanel } from './components/layout/onboarding/ShortcutPanel';
import { ErrorBoundary } from './components/layout/errors/ErrorBoundary';


import { ClerkProvider } from '@clerk/clerk-react';
import { useT } from './i18n/LanguageContext';
import type { ReactNode } from 'react';

function ClerkWrapper({ children }: { children: ReactNode }) {
  const { lang } = useT();
  const zhCN = {
    socialButtonsBlockButton: '使用 {{provider}} 登录',
    formFieldLabel__emailAddress: '邮箱地址',
    formFieldLabel__password: '密码',
    formFieldAction__forgotPassword: '忘记密码？',
    signIn: {
      start: { title: '登录 PromptBench', subtitle: '欢迎回来', actionText: '没有账号？', actionLink: '注册' },
      alternativeMethods: { title: '或使用其他方式登录' },
    },
    signUp: {
      start: { title: '注册 PromptBench', subtitle: '创建账号开始使用', actionText: '已有账号？', actionLink: '登录' },
    },
    userButton: { action__signOut: '退出登录' },
  };
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} localization={lang === 'zh-CN' ? zhCN : undefined}>
      {children}
    </ClerkProvider>
  );
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-bench-border)] border-t-[var(--color-bench-accent)] animate-spin" /></div>
);
function App() {
  return (
    <ToastProvider><ThemeProvider><LanguageProvider><ClerkWrapper>
      <BrowserRouter>
        <Layout>
          <OnboardingGuide />
          <ShortcutPanel />
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<TemplateBrowser />} />
            <Route path="/template/:id" element={<TemplateDetail />} />
            <Route path="/author/:authorId" element={<AuthorPage />} />
            <Route path="/generate" element={<Suspense fallback={<LoadingFallback />}><GeneratePage /></Suspense>} />
            <Route path="/prompts" element={<Suspense fallback={<LoadingFallback />}><PromptsPage /></Suspense>} />
            <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>
    </ClerkWrapper></LanguageProvider></ThemeProvider></ToastProvider>
  );
}

export default App;