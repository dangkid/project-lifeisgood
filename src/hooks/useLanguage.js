import { useState, useEffect } from 'react';
import { i18nService } from '../services/i18nService';

/**
 * Hook para usar traducciones y reaccionar a cambios de idioma
 */
export function useLanguage() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'es';
  });
  const [, setRenderKey] = useState(0);

  useEffect(() => {
    // Escuchar cambios de idioma
    const handleLanguageChange = (e) => {
      const newLang = e.detail || (localStorage.getItem('language') || 'es');
      setLanguage(newLang);
      setRenderKey(prev => prev + 1); // Forzar rerender
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  return {
    t: (key) => i18nService.t(key),
    language,
    setLanguage: (lang) => {
      localStorage.setItem('language', lang);
      i18nService.setLanguage(lang);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }
  };
}

export default useLanguage;
