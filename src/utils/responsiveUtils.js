// Utilidades para diseño responsive optimizado para dispositivos AAC

/**
 * Obtiene el tipo de dispositivo basado en el ancho de pantalla
 * @returns {string} Tipo de dispositivo
 */
export function getDeviceType() {
  const width = window.innerWidth;
  
  if (width < 375) return 'mobile-small';     // iPhone SE, pequeños
  if (width < 640) return 'mobile';           // Teléfonos
  if (width < 768) return 'tablet-small';     // Tablets pequeñas
  if (width < 1024) return 'tablet';          // iPads (portrait)
  if (width < 1280) return 'desktop-small';   // Laptops pequeñas
  if (width < 1536) return 'desktop';         // Desktop estándar
  return 'desktop-large';                     // Pantallas grandes
}

/**
 * Obtiene la orientación actual del dispositivo
 * @returns {string} 'portrait' o 'landscape'
 */
export function getOrientation() {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Calcula el número óptimo de columnas para grid basado en el dispositivo
 * @param {string} deviceType - Tipo de dispositivo
 * @param {string} orientation - Orientación
 * @returns {number} Número de columnas recomendado
 */
export function getOptimalColumns(deviceType, orientation) {
  const config = {
    'mobile-small': { portrait: 2, landscape: 3 },
    'mobile': { portrait: 2, landscape: 3 },
    'tablet-small': { portrait: 3, landscape: 4 },
    'tablet': { portrait: 3, landscape: 5 },
    'desktop-small': { portrait: 4, landscape: 5 },
    'desktop': { portrait: 5, landscape: 6 },
    'desktop-large': { portrait: 6, landscape: 7 }
  };
  
  return config[deviceType]?.[orientation] || 3;
}

/**
 * Obtiene el tamaño de botón recomendado para el dispositivo
 * @param {string} deviceType - Tipo de dispositivo
 * @returns {string} Tamaño de botón ('small', 'medium', 'large', 'xlarge')
 */
export function getRecommendedButtonSize(deviceType) {
  const sizes = {
    'mobile-small': 'medium',
    'mobile': 'large',
    'tablet-small': 'large',
    'tablet': 'xlarge',
    'desktop-small': 'xlarge',
    'desktop': 'xlarge',
    'desktop-large': 'xlarge'
  };
  
  return sizes[deviceType] || 'large';
}

/**
 * Obtiene el tamaño de fuente recomendado para el dispositivo
 * @param {string} deviceType - Tipo de dispositivo
 * @param {string} elementType - Tipo de elemento ('button', 'heading', 'text')
 * @returns {string} Clase de tamaño de Tailwind
 */
export function getRecommendedFontSize(deviceType, elementType = 'button') {
  const config = {
    'button': {
      'mobile-small': 'text-base',
      'mobile': 'text-lg',
      'tablet-small': 'text-xl',
      'tablet': 'text-2xl',
      'desktop-small': 'text-2xl',
      'desktop': 'text-3xl',
      'desktop-large': 'text-3xl'
    },
    'heading': {
      'mobile-small': 'text-xl',
      'mobile': 'text-2xl',
      'tablet-small': 'text-3xl',
      'tablet': 'text-4xl',
      'desktop-small': 'text-4xl',
      'desktop': 'text-5xl',
      'desktop-large': 'text-6xl'
    },
    'text': {
      'mobile-small': 'text-sm',
      'mobile': 'text-base',
      'tablet-small': 'text-lg',
      'tablet': 'text-xl',
      'desktop-small': 'text-xl',
      'desktop': 'text-2xl',
      'desktop-large': 'text-2xl'
    }
  };
  
  return config[elementType]?.[deviceType] || 'text-base';
}

/**
 * Obtiene el padding recomendado para botones
 * @param {string} deviceType - Tipo de dispositivo
 * @returns {string} Clase de padding de Tailwind
 */
export function getRecommendedPadding(deviceType) {
  const padding = {
    'mobile-small': 'p-3',
    'mobile': 'p-4',
    'tablet-small': 'p-5',
    'tablet': 'p-6',
    'desktop-small': 'p-6',
    'desktop': 'p-8',
    'desktop-large': 'p-8'
  };
  
  return padding[deviceType] || 'p-4';
}

/**
 * Verifica si el dispositivo es táctil
 * @returns {boolean} True si es dispositivo táctil
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         navigator.msMaxTouchPoints > 0;
}

/**
 * Obtiene el espaciado recomendado entre elementos
 * @param {string} deviceType - Tipo de dispositivo
 * @returns {string} Clase de gap de Tailwind
 */
export function getRecommendedGap(deviceType) {
  const gaps = {
    'mobile-small': 'gap-2',
    'mobile': 'gap-3',
    'tablet-small': 'gap-4',
    'tablet': 'gap-5',
    'desktop-small': 'gap-6',
    'desktop': 'gap-8',
    'desktop-large': 'gap-10'
  };
  
  return gaps[deviceType] || 'gap-4';
}

/**
 * Genera clases CSS responsive basadas en el dispositivo
 * @param {Object} options - Opciones de personalización
 * @returns {string} Clases CSS combinadas
 */
export function generateResponsiveClasses(options = {}) {
  const {
    baseClasses = '',
    mobileClasses = '',
    tabletClasses = '',
    desktopClasses = '',
    touchClasses = '',
    nonTouchClasses = ''
  } = options;

  const deviceType = getDeviceType();
  const isTouch = isTouchDevice();
  
  let classes = baseClasses;
  
  // Añadir clases específicas por dispositivo
  if (deviceType.includes('mobile')) {
    classes += ' ' + mobileClasses;
  } else if (deviceType.includes('tablet')) {
    classes += ' ' + tabletClasses;
  } else if (deviceType.includes('desktop')) {
    classes += ' ' + desktopClasses;
  }
  
  // Añadir clases específicas por tipo de interacción
  if (isTouch) {
    classes += ' ' + touchClasses;
  } else {
    classes += ' ' + nonTouchClasses;
  }
  
  return classes.trim();
}

export default {
  getDeviceType,
  getOrientation,
  getOptimalColumns,
  getRecommendedButtonSize,
  getRecommendedFontSize,
  getRecommendedPadding,
  isTouchDevice,
  getRecommendedGap,
  generateResponsiveClasses
};