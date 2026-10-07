import { createContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LOCALE, locales } from '../locales';

const LOCALE_STORAGE_KEY = 'stadionhub-locale';

const getNestedValue = (source, path) =>
  path.split('.').reduce((current, part) => current?.[part], source);

const interpolate = (template, variables = {}) =>
  template.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);

const getInitialLocale = () => {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return locales[stored] ? stored : DEFAULT_LOCALE;
};

export const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale) => {
    if (!locales[nextLocale]) return;
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    setLocaleState(nextLocale);
  };

  const dictionary = locales[locale] || locales[DEFAULT_LOCALE];

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key, variables = {}) => {
        const resolved = getNestedValue(dictionary, key);

        if (typeof resolved === 'string') {
          return interpolate(resolved, variables);
        }

        if (resolved !== undefined) {
          return resolved;
        }

        return key;
      },
    }),
    [dictionary, locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
