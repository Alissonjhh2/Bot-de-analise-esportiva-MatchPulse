'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Locale } from './translations';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('pt');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within I18nProvider');
  }
  return context.locale;
}
