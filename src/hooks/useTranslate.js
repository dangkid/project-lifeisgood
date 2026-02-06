import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

/**
 * Hook para reaccionar a cambios de idioma
 */
export function useTranslate() {
  const { language, t } = useApp();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  return { t, language };
}

export default useTranslate;
