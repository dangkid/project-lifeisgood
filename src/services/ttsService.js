// Text-to-Speech Service - Mismas voces en TODOS los dispositivos
import { voiceRssService } from './azureTtsService.js';

class TextToSpeechService {
  async speak(text, options = {}) {
    const voiceGender = options.voiceGender || 'female';
    return voiceRssService.speak(text, voiceGender);
  }

  stop() {
    voiceRssService.stop();
  }

  isSpeaking() {
    return voiceRssService.isSpeaking();
  }
}

export const ttsService = new TextToSpeechService();

