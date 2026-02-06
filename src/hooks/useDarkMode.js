import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export const useDarkMode = () => {
  const { isDark } = useApp();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleDarkModeChange = () => {
      forceUpdate({});
    };

    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);

  return isDark;
};

export default useDarkMode;
