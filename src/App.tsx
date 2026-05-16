import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './i18n/ThemeContext';
import { Layout } from './components/layout/Layout';
import { PromptsPage } from './components/prompts/PromptsPage';
import { HomePage } from './components/layout/HomePage';
import { TemplateBrowser } from './components/templates/TemplateBrowser';
import { TemplateDetail } from './components/templates/TemplateDetail';
const GeneratePage = lazy(() => import('./components/workspace/GeneratePage').then(m => ({ default: m.GeneratePage })));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
import { NotFound } from './components/layout/errors/NotFound';
import { OnboardingGuide } from './components/layout/onboarding/OnboardingGuide';
import { ShortcutPanel } from './components/layout/onboarding/ShortcutPanel';
import { ErrorBoundary } from './components/layout/errors/ErrorBoundary';


const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-bench-border)] border-t-[var(--color-bench-accent)] animate-spin" /></div>
);
function App() {
  return (
    <ThemeProvider><LanguageProvider>
      <BrowserRouter>
        <Layout>
          <OnboardingGuide />
          <ShortcutPanel />
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<TemplateBrowser />} />
            <Route path="/template/:id" element={<TemplateDetail />} />
            <Route path="/generate" element={<Suspense fallback={<LoadingFallback />}><GeneratePage /></Suspense>} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>
    </LanguageProvider></ThemeProvider>
  );
}

export default App;