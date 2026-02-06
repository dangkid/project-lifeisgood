import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { i18nService } from '../services/i18nService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguageState] = useState(() => {
    // Verificar si hay idioma guardado
    const saved = localStorage.getItem('language');
    if (saved) {
      return saved;
    }
    
    // Detectar idioma del navegador
    const browserLang = navigator.language || navigator.languages?.[0] || 'es';
    const langCode = browserLang.split('-')[0]; // Obtener código de idioma (ej: 'es' de 'es-ES')
    
    // Idiomas soportados
    const supportedLanguages = ['es', 'en', 'ca'];
    
    // Usar idioma detectado si está soportado, si no usar español
    return supportedLanguages.includes(langCode) ? langCode : 'es';
  });
  const [renderKey, setRenderKey] = useState(0);

  // Inicializar dark mode e idioma al cargar
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved !== null ? saved === 'true' : prefersDark;
    
    setIsDark(shouldBeDark);
    applyDarkMode(shouldBeDark);
    
    // Inicializar idioma en i18nService con el idioma actual
    const currentLang = localStorage.getItem('language') || (() => {
      const browserLang = navigator.language || navigator.languages?.[0] || 'es';
      const langCode = browserLang.split('-')[0];
      const supportedLanguages = ['es', 'en', 'ca'];
      return supportedLanguages.includes(langCode) ? langCode : 'es';
    })();
    
    i18nService.setLanguage(currentLang);
    setLanguageState(currentLang);
    localStorage.setItem('language', currentLang);
  }, []);

  // Escuchar cambios de dark mode desde componentes
  useEffect(() => {
    const handleDarkModeChange = (e) => {
      const isDark = e.detail;
      setIsDark(isDark);
      applyDarkMode(isDark);
      localStorage.setItem('darkMode', isDark.toString());
      setRenderKey(prev => prev + 1);
    };

    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);

  // Escuchar cambios de idioma desde componentes
  useEffect(() => {
    const handleLanguageChange = (e) => {
      const newLang = e.detail;
      setLanguageState(newLang);
      localStorage.setItem('language', newLang);
      i18nService.setLanguage(newLang);
      setRenderKey(prev => prev + 1);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const applyDarkMode = (dark) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const t = useCallback((key) => {
    return i18nService.t(key);
  }, [language]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prevIsDark => {
      const newValue = !prevIsDark;
      applyDarkMode(newValue);
      localStorage.setItem('darkMode', newValue.toString());
      window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: newValue }));
      return newValue;
    });
  }, []);

  const setLanguage = useCallback((lang) => {
    console.log(`AppContext: setLanguage called with ${lang}`);
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18nService.setLanguage(lang);
    setRenderKey(prev => prev + 1);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  }, []);

  const value = useMemo(() => ({
    isDark,
    toggleDarkMode,
    language,
    setLanguage,
    t,
    renderKey
  }), [isDark, language, renderKey, toggleDarkMode, setLanguage, t]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
