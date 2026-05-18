import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Lang } from './translations';
import { t } from './translations';
import { STORAGE_KEYS } from '../utils/constants';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType>({ lang: 'zh-CN', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.lang);
    return (saved === 'zh-CN' || saved === 'en') ? saved : 'zh-CN';
  });

  const changeLang = useCallback((l: Lang) => {
    document.documentElement.lang = l === 'zh-CN' ? 'zh-CN' : 'en';
    document.title = l === 'zh-CN' ? 'PromptBench — 结构化 Prompt 工程' : 'PromptBench — Structured Prompt Engineering';
    localStorage.setItem(STORAGE_KEYS.lang, l);
    setLang(l);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t: (k: string) => t(lang, k) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LangContext);
  return { t: ctx.t, lang: ctx.lang, setLang: ctx.setLang };
}