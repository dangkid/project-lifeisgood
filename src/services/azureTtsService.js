// Sistema de voces SIMPLE y FUNCIONAL
// Voces del navegador con diferencia CLARA entre hombre y mujer

class SimpleTtsService {
  constructor() {
    this.synth = window.speechSynthesis;
  }

  async speak(text, voiceGender = 'female') {
    console.log(`🎤 REPRODUCIENDO: "${text}" | GÉNERO: ${voiceGender}`);
    
    return new Promise((resolve, reject) => {
      // IMPORTANTE: Cancelar cualquier voz anterior
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configuración base
      utterance.lang = 'es-ES';
      utterance.volume = 1.0;
      
      // CONFIGURACIÓN MUY DIFERENTE según género
      if (voiceGender === 'male') {
        utterance.pitch = 0.6;   // MUY GRAVE (hombre)
        utterance.rate = 0.85;   // Un poco más lento
        console.log('👨 VOZ MASCULINA - pitch: 0.6 (grave)');
      } else {
        utterance.pitch = 1.4;   // MUY AGUDO (mujer)
        utterance.rate = 0.95;   // Velocidad normal
        console.log('👩 VOZ FEMENINA - pitch: 1.4 (agudo)');
      }

      // Eventos
      utterance.onstart = () => {
        console.log('▶️ Reproducción iniciada');
      };

      utterance.onend = () => {
        console.log('✅ Reproducción completada');
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('❌ Error:', error);
        reject(error);
      };

      // REPRODUCIR
      this.synth.speak(utterance);
    });
  }

  stop() {
    this.synth.cancel();
  }

  isSpeaking() {
    return this.synth.speaking;
  }
}

export const voiceRssService = new SimpleTtsService();
