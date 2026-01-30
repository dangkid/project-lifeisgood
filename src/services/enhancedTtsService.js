// Servicio TTS MEJORADO con voces reales y configuración avanzada
// Sistema de voces masculinas/femeninas de alta calidad

class EnhancedTtsService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.availableVoices = [];
    this.highQualityVoices = [];
    this.userVoicePreferences = {};
    
    // Configuración por defecto
    this.defaultSettings = {
      volume: 1.0,
      rate: 1.0,
      pitch: 1.0,
      lang: 'es-ES',
      voiceGender: 'female',
      voiceName: null // Nombre específico de voz
    };
    
    // Cargar configuración
    this.loadSettings();
    this.loadVoices();
  }

  // Cargar voces disponibles y clasificarlas
  loadVoices() {
    // Obtener todas las voces
    this.availableVoices = this.synth.getVoices();
    
    // Si no hay voces, esperar a que se carguen
    if (this.availableVoices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.availableVoices = this.synth.getVoices();
        this.classifyVoices();
        console.log(`🎤 Voces cargadas: ${this.availableVoices.length} disponibles`);
      };
    } else {
      this.classifyVoices();
      console.log(`🎤 Voces disponibles: ${this.availableVoices.length}`);
    }
  }

  // Clasificar voces por calidad y género
  classifyVoices() {
    const spanishVoices = this.availableVoices.filter(v => 
      v.lang.startsWith('es') || v.lang.includes('es-')
    );
    
    // Voces de alta calidad conocidas (nombres que indican buena calidad)
    const highQualityKeywords = [
      'natural', 'premium', 'neural', 'wave', 'studio', 'hd',
      'microsoft', 'google', 'apple', 'samantha', 'alex', 'carlos',
      'carmen', 'jorge', 'lucia', 'diego', 'elena', 'pedro'
    ];
    
    // Clasificar voces españolas
    this.highQualityVoices = spanishVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      return highQualityKeywords.some(keyword => name.includes(keyword));
    });
    
    // Si no encontramos voces de alta calidad, usar todas las españolas
    if (this.highQualityVoices.length === 0) {
      this.highQualityVoices = spanishVoices;
    }
    
    console.log(`🎯 Voces de alta calidad: ${this.highQualityVoices.length}`);
  }

  // Obtener las mejores voces por género
  getBestVoicesByGender(gender) {
    const genderVoices = this.highQualityVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      
      // Detección mejorada de género
      if (gender === 'female') {
        // Palabras clave para voces femeninas
        const femaleKeywords = ['female', 'mujer', 'woman', 'femenina', 'ella', 'mujer', 'chica'];
        const maleKeywords = ['male', 'hombre', 'man', 'masculino', 'él', 'hombre', 'chico'];
        
        // Verificar si es femenina y NO masculina
        const isFemale = femaleKeywords.some(keyword => name.includes(keyword) || lang.includes(keyword));
        const isMale = maleKeywords.some(keyword => name.includes(keyword) || lang.includes(keyword));
        
        return isFemale || (!isMale && (name.includes('español') || lang.includes('es')));
      } else {
        // Palabras clave para voces masculinas
        const maleKeywords = ['male', 'hombre', 'man', 'masculino', 'él', 'hombre', 'chico'];
        const femaleKeywords = ['female', 'mujer', 'woman', 'femenina', 'ella', 'mujer', 'chica'];
        
        // Verificar si es masculina y NO femenina
        const isMale = maleKeywords.some(keyword => name.includes(keyword) || lang.includes(keyword));
        const isFemale = femaleKeywords.some(keyword => name.includes(keyword) || lang.includes(keyword));
        
        return isMale || (!isFemale && (name.includes('español') || lang.includes('es')));
      }
    });
    
    return genderVoices;
  }

  // Encontrar la mejor voz para un género específico
  findBestVoiceForGender(gender) {
    const genderVoices = this.getBestVoicesByGender(gender);
    
    if (genderVoices.length === 0) {
      // Fallback: usar cualquier voz española
      const spanishVoices = this.availableVoices.filter(v => 
        v.lang.startsWith('es') || v.lang.includes('es-')
      );
      
      if (spanishVoices.length > 0) {
        // Ajustar pitch/rate según género
        const voice = spanishVoices[0];
        return {
          voice,
          pitch: gender === 'male' ? 0.8 : 1.2,
          rate: gender === 'male' ? 0.95 : 1.05
        };
      }
      
      return null;
    }
    
    // Priorizar voces con nombres que indiquen buena calidad
    const prioritizedVoices = genderVoices.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Dar prioridad a voces con palabras clave de calidad
      const qualityKeywords = ['natural', 'premium', 'neural', 'wave', 'studio'];
      const aScore = qualityKeywords.filter(kw => aName.includes(kw)).length;
      const bScore = qualityKeywords.filter(kw => bName.includes(kw)).length;
      
      return bScore - aScore;
    });
    
    return {
      voice: prioritizedVoices[0],
      pitch: gender === 'male' ? 0.9 : 1.1,
      rate: 1.0
    };
  }

  // Cargar configuración desde localStorage
  loadSettings() {
    try {
      const saved = localStorage.getItem('ttsEnhancedSettings');
      if (saved) {
        this.defaultSettings = { ...this.defaultSettings, ...JSON.parse(saved) };
      }
      
      // Cargar preferencias de usuario
      const userPrefs = localStorage.getItem('userVoicePreferences');
      if (userPrefs) {
        this.userVoicePreferences = JSON.parse(userPrefs);
      }
    } catch (error) {
      console.error('Error cargando configuración TTS:', error);
    }
  }

  // Guardar configuración
  saveSettings() {
    try {
      localStorage.setItem('ttsEnhancedSettings', JSON.stringify(this.defaultSettings));
      localStorage.setItem('userVoicePreferences', JSON.stringify(this.userVoicePreferences));
    } catch (error) {
      console.error('Error guardando configuración TTS:', error);
    }
  }

  // Actualizar configuración
  updateSettings(newSettings) {
    this.defaultSettings = { ...this.defaultSettings, ...newSettings };
    this.saveSettings();
  }

  // Configurar voz para un usuario específico
  setUserVoicePreference(userId, gender, voiceName = null) {
    this.userVoicePreferences[userId] = {
      gender,
      voiceName,
      timestamp: Date.now()
    };
    this.saveSettings();
    
    console.log(`👤 Preferencia de voz guardada para usuario ${userId}: ${gender}${voiceName ? ` (${voiceName})` : ''}`);
  }

  // Obtener configuración de voz para un usuario
  getUserVoicePreference(userId) {
    return this.userVoicePreferences[userId] || { gender: 'female', voiceName: null };
  }

  // Hablar texto con la mejor voz disponible
  async speak(text, options = {}) {
    const userId = options.userId || 'default';
    const userPrefs = this.getUserVoicePreference(userId);
    const voiceGender = options.voiceGender || userPrefs.gender || 'female';
    const settings = { ...this.defaultSettings, ...options };
    
    console.log(`🎤 REPRODUCIENDO: "${text}" | GÉNERO: ${voiceGender} | USUARIO: ${userId}`);
    
    return new Promise((resolve, reject) => {
      // Cancelar cualquier voz anterior
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configuración base
      utterance.lang = settings.lang;
      utterance.volume = settings.volume;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      
      // Buscar la mejor voz para el género
      const voiceConfig = this.findBestVoiceForGender(voiceGender);
      
      if (voiceConfig && voiceConfig.voice) {
        utterance.voice = voiceConfig.voice;
        utterance.pitch = voiceConfig.pitch || settings.pitch;
        utterance.rate = voiceConfig.rate || settings.rate;
        
        console.log(`🎤 Usando voz: ${voiceConfig.voice.name} (${voiceConfig.voice.lang})`);
        console.log(`🎤 Ajustes: pitch=${utterance.pitch}, rate=${utterance.rate}`);
      } else {
        // Fallback con ajustes de género
        if (voiceGender === 'male') {
          utterance.pitch = 0.8;
          utterance.rate = 0.95;
          console.log('👨 VOZ MASCULINA (fallback con ajustes)');
        } else {
          utterance.pitch = 1.2;
          utterance.rate = 1.05;
          console.log('👩 VOZ FEMENINA (fallback con ajustes)');
        }
      }

      // Eventos
      utterance.onstart = () => {
        console.log('▶️ Reproducción iniciada');
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        console.log('✅ Reproducción completada');
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('❌ Error TTS:', error);
        reject(error);
      };

      // Reproducir
      this.synth.speak(utterance);
    });
  }

  // Detener reproducción
  stop() {
    this.synth.cancel();
  }

  // Verificar si está hablando
  isSpeaking() {
    return this.synth.speaking;
  }

  // Obtener lista de voces disponibles
  getAvailableVoices() {
    return this.availableVoices;
  }

  // Obtener voces clasificadas por género
  getVoicesByGender(gender) {
    return this.getBestVoicesByGender(gender);
  }

  // Obtener configuración actual
  getSettings() {
    return { ...this.defaultSettings };
  }

  // Métodos de utilidad para ajustes rápidos
  setRate(rate) {
    this.updateSettings({ rate: Math.max(0.5, Math.min(2.0, rate)) });
  }

  setVolume(volume) {
    this.updateSettings({ volume: Math.max(0, Math.min(1, volume)) });
  }

  setPitch(pitch) {
    this.updateSettings({ pitch: Math.max(0.5, Math.min(2.0, pitch)) });
  }

  // Probar todas las voces disponibles
  testAllVoices(text = 'Hola, esta es una prueba de voz') {
    const spanishVoices = this.availableVoices.filter(v => 
      v.lang.startsWith('es') || v.lang.includes('es-')
    );
    
    console.log(`🔊 Probando ${spanishVoices.length} voces en español:`);
    
    spanishVoices.forEach((voice, index) => {
      setTimeout(() => {
        console.log(`🎤 Probando voz ${index + 1}: ${voice.name} (${voice.lang})`);
        
        const utterance = new SpeechSynthesisUtterance(`${text}. Voz número ${index + 1}`);
        utterance.voice = voice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.7;
        
        this.synth.speak(utterance);
      }, index * 3000);
    });
  }
}

// Crear instancia global del servicio
export const enhancedTtsService = new EnhancedTtsService();

// Exportar funciones de utilidad
export const setUserVoiceGender = (userId, gender) => {
  enhancedTtsService.setUserVoicePreference(userId, gender);
};

export const speakText = (text, options = {}) => {
  return enhancedTtsService.speak(text, options);
};

export const getAvailableVoices = () => {
  return enhancedTtsService.getAvailableVoices();
};

export default enhancedTtsService;