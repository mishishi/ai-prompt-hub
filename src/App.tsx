import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './components/layout/HomePage';
import { TemplateBrowser } from './components/templates/TemplateBrowser';
import { TemplateDetail } from './components/templates/TemplateDetail';
import { GeneratePage } from './components/workspace/GeneratePage';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<TemplateBrowser />} />
            <Route path="/template/:id" element={<TemplateDetail />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/edit/:id" element={<PromptEditor />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;