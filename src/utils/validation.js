/**
 * Sistema de Validación de Datos
 * Valida todos los datos antes de enviarlos a Firestore
 */

/**
 * Validar botón de comunicación
 * @param {Object} data - Datos del botón
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateButton = (data) => {
  const errors = {};

  // Validar texto
  if (!data.text || data.text.trim().length === 0) {
    errors.text = 'El texto es requerido';
  } else if (data.text.length > 100) {
    errors.text = 'El texto no puede exceder 100 caracteres';
  }

  // Validar categoría
  if (data.category && typeof data.category !== 'string') {
    errors.category = 'La categoría debe ser un texto';
  }

  // Validar imagen (URL opcional)
  if (data.image && !isValidUrl(data.image)) {
    errors.image = 'La URL de imagen no es válida';
  }

  // Validar color (formato hex o tailwind)
  if (data.color && !isValidColor(data.color)) {
    errors.color = 'El formato de color no es válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar perfil de paciente
 * @param {Object} data - Datos del perfil
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateProfile = (data) => {
  const errors = {};

  // Validar nombre
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'El nombre es requerido';
  } else if (data.name.length > 100) {
    errors.name = 'El nombre no puede exceder 100 caracteres';
  }

  // Validar edad (si existe)
  if (data.age !== undefined && data.age !== null) {
    if (!Number.isInteger(data.age) || data.age < 0 || data.age > 120) {
      errors.age = 'La edad debe ser un número entre 0 y 120';
    }
  }

  // Validar diagnóstico (si existe)
  if (data.diagnosis && typeof data.diagnosis !== 'string') {
    errors.diagnosis = 'El diagnóstico debe ser un texto';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar usuario
 * @param {Object} data - Datos del usuario
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateUser = (data) => {
  const errors = {};

  // Validar email
  if (!data.email) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'El email no es válido';
  }

  // Validar password (en registro)
  if (data.password !== undefined) {
    if (data.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
  }

  // Validar nombre
  if (data.displayName && data.displayName.trim().length === 0) {
    errors.displayName = 'El nombre no puede estar vacío';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar organización
 * @param {Object} data - Datos de la organización
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateOrganization = (data) => {
  const errors = {};

  // Validar nombre
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'El nombre de la organización es requerido';
  } else if (data.name.length > 200) {
    errors.name = 'El nombre no puede exceder 200 caracteres';
  }

  // Validar descripción (opcional)
  if (data.description && data.description.length > 500) {
    errors.description = 'La descripción no puede exceder 500 caracteres';
  }

  // Validar website (opcional)
  if (data.website && !isValidUrl(data.website)) {
    errors.website = 'La URL del website no es válida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar mensaje de foro
 * @param {Object} data - Datos del mensaje
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateForumMessage = (data) => {
  const errors = {};

  // Validar título
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'El título es requerido';
  } else if (data.title.length > 200) {
    errors.title = 'El título no puede exceder 200 caracteres';
  }

  // Validar contenido
  if (!data.content || data.content.trim().length === 0) {
    errors.content = 'El contenido es requerido';
  } else if (data.content.length > 5000) {
    errors.content = 'El contenido no puede exceder 5000 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar URL
 * @param {string} url - URL a validar
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar color
 * @param {string} color - Color a validar (hex o tailwind)
 * @returns {boolean}
 */
export const isValidColor = (color) => {
  // Validar formato hex (#FFF, #FFFFFF)
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexRegex.test(color)) return true;

  // Validar colores tailwind comunes
  const tailwindColors = [
    'red', 'blue', 'green', 'yellow', 'purple', 'pink',
    'indigo', 'cyan', 'teal', 'emerald', 'rose', 'orange'
  ];
  
  return tailwindColors.includes(color);
};

/**
 * Validar rol de usuario
 * @param {string} role - Rol a validar
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  const validRoles = ['admin', 'especialista', 'miembro', 'paciente', 'familiar'];
  return validRoles.includes(role);
};

/**
 * Formatear errores de validación para mostrar en UI
 * @param {Object} errors - Objeto con errores
 * @returns {string} - Mensaje formateado
 */
export const formatValidationErrors = (errors) => {
  const errorMessages = Object.values(errors);
  return errorMessages.join(', ');
};

/**
 * Sanitizar entrada de texto para evitar XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeInput = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validar tamaño de archivo
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo no puede exceder ${maxSizeMB}MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validar tipo de archivo
 * @param {File} file - Archivo a validar
 * @param {Array<string>} allowedTypes - Tipos MIME permitidos
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validar archivo de imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  const errors = {};

  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.isValid) {
    errors.size = sizeValidation.error;
  }

  const typeValidation = validateFileType(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  if (!typeValidation.isValid) {
    errors.type = typeValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
