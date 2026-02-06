/**
 * Servicio de Internacionalización (i18n)
 * Maneja traducción multi-idioma
 */

import React from 'react';
import es from '../i18n/es.json';
import en from '../i18n/en.json';
import ca from '../i18n/ca.json';

const translations = {
  es,
  en,
  ca
};

class I18nService {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'es';
    this.listeners = [];
  }

  /**
   * Obtener traducción para una clave
   */
  t(key) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Retorna la clave si no encuentra traducción
      }
    }
    
    return value || key;
  }

  /**
   * Cambiar idioma actual
   */
  setLanguage(lang) {
    if (lang in translations) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Obtener idioma actual
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Obtener lista de idiomas disponibles
   */
  getAvailableLanguages() {
    return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'ca', name: 'Català', flag: '🇨🇦' }
    ];
  }

  /**
   * Suscribirse a cambios de idioma
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificar a todos los listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  /**
   * Traducción con interpolación (ejemplo: t('hello.name', { name: 'Juan' }))
   */
  tInterpolate(key, values = {}) {
    let text = this.t(key);
    Object.keys(values).forEach(k => {
      text = text.replace(new RegExp(`{${k}}`, 'g'), values[k]);
    });
    return text;
  }
}

export const i18nService = new I18nService();

/**
 * Hook personalizado para usar i18n en componentes
 */
export const useI18n = () => {
  // Intentar usar AppContext primero
  let appContext = null;
  try {
    // Importar dinámicamente para evitar circular dependency
    const { useApp } = require('../contexts/AppContext');
    appContext = useApp();
  } catch (e) {
    // Si no está disponible AppContext, usar fallback
  }

  // Si AppContext está disponible, usarlo
  if (appContext) {
    return {
      t: (key) => appContext.t(key),
      tInterpolate: (key, values) => i18nService.tInterpolate(key, values),
      language: appContext.language,
      setLanguage: appContext.setLanguage,
      getAvailableLanguages: i18nService.getAvailableLanguages.bind(i18nService)
    };
  }

  // Fallback: usar React hooks
  const [language, setLanguageState] = React.useState(i18nService.getLanguage());

  React.useEffect(() => {
    const unsubscribe = i18nService.subscribe(setLanguageState);
    return unsubscribe;
  }, []);

  return {
    t: (key) => i18nService.t(key),
    tInterpolate: (key, values) => i18nService.tInterpolate(key, values),
    language,
    setLanguage: i18nService.setLanguage.bind(i18nService),
    getAvailableLanguages: i18nService.getAvailableLanguages.bind(i18nService)
  };
};

export default i18nService;
