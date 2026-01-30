// Sistema de voces MEJORADO con voces reales del navegador
// Soporte para múltiples voces y configuración avanzada

class EnhancedTtsService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.availableVoices = [];
    this.loadVoices();
    
    // Configuración por defecto
    this.defaultSettings = {
      volume: 1.0,
      rate: 1.0,
      pitch: 1.0,
      lang: 'es-ES'
    };
    
    // Cargar configuración guardada
    this.loadSettings();
  }

  loadVoices() {
    // Cargar voces disponibles
    this.availableVoices = this.synth.getVoices();
    
    // Si no hay voces, intentar cargarlas cuando estén disponibles
    if (this.availableVoices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.availableVoices = this.synth.getVoices();
        console.log(`🎤 Voces cargadas: ${this.availableVoices.length} disponibles`);
      };
    } else {
      console.log(`🎤 Voces disponibles: ${this.availableVoices.length}`);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('ttsSettings');
      if (saved) {
        this.defaultSettings = { ...this.defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error cargando configuración TTS:', error);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('ttsSettings', JSON.stringify(this.defaultSettings));
    } catch (error) {
      console.error('Error guardando configuración TTS:', error);
    }
  }

  updateSettings(newSettings) {
    this.defaultSettings = { ...this.defaultSettings, ...newSettings };
    this.saveSettings();
  }

  getVoices() {
    return this.availableVoices;
  }

  getVoiceByGender(gender) {
    const spanishVoices = this.availableVoices.filter(v =>
      v.lang.startsWith('es') || v.lang.startsWith('es-')
    );
    
    if (spanishVoices.length === 0) {
      return null; // No hay voces en español
    }

    // Intentar encontrar una voz que coincida con el género
    const genderVoices = spanishVoices.filter(v => {
      const voiceName = v.name.toLowerCase();
      if (gender === 'female') {
        return voiceName.includes('female') || voiceName.includes('mujer') ||
               voiceName.includes('woman') || voiceName.includes('español') ||
               !voiceName.includes('male') && !voiceName.includes('hombre');
      } else {
        return voiceName.includes('male') || voiceName.includes('hombre') ||
               voiceName.includes('man');
      }
    });

    return genderVoices.length > 0 ? genderVoices[0] : spanishVoices[0];
  }

  async speak(text, options = {}) {
    const voiceGender = options.voiceGender || 'female';
    const settings = { ...this.defaultSettings, ...options };
    
    console.log(`🎤 REPRODUCIENDO: "${text}" | GÉNERO: ${voiceGender} | VELOCIDAD: ${settings.rate}`);
    
    return new Promise((resolve, reject) => {
      // Cancelar cualquier voz anterior
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configuración base
      utterance.lang = settings.lang;
      utterance.volume = settings.volume;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      
      // Intentar usar una voz real del navegador
      const selectedVoice = this.getVoiceByGender(voiceGender);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🎤 Usando voz: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        // Fallback a configuración por pitch/rate
        if (voiceGender === 'male') {
          utterance.pitch = 0.7;
          utterance.rate = 0.9;
          console.log('👨 VOZ MASCULINA (fallback)');
        } else {
          utterance.pitch = 1.3;
          utterance.rate = 1.0;
          console.log('👩 VOZ FEMENINA (fallback)');
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

  stop() {
    this.synth.cancel();
  }

  isSpeaking() {
    return this.synth.speaking;
  }

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
}

export const voiceRssService = new EnhancedTtsService();
