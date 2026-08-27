/**
 * Language state for the whole app (master §3 priority: km → en → vi).
 * Content strings resolve through the schema's fallback chain; UI chrome
 * resolves through lib/i18n.ts.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { createTranslator, type Translator } from '@/lib/i18n';

export type UiLanguage = 'km' | 'en' | 'vi';

interface LanguageContextValue {
  lang: UiLanguage;
  setLang: (lang: UiLanguage) => void;
  /** Content language passed to @kh/content-client (schema-supported codes). */
  contentLang: 'km' | 'en';
  t: Translator;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<UiLanguage>('km');
  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      // vi is UI-only for now; schema content ships as km/en.
      contentLang: lang === 'en' ? 'en' : 'km',
      t: createTranslator(lang),
    }),
    [lang],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
}
