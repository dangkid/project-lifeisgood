import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';

/**
 * Hook que fuerza un re-render cuando cambia el idioma
 * Debe ser usado en componentes que tengan traduciones
 */
export function useLanguageChange() {
  const { renderKey } = useApp();
  const [key, setKey] = useState(renderKey);

  useEffect(() => {
    if (renderKey !== key) {
      setKey(renderKey);
    }
  }, [renderKey, key]);

  return key;
}
