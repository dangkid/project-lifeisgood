import { useState } from 'react';
import { Volume2, X, Trash2 } from 'lucide-react';
import { enhancedTtsService } from '../../services/enhancedTtsService';
import { recordPhraseCreated } from '../../services/profileService';
import { addToRecentPhrases } from './RecentPhrases';

export default function PhraseBuilder({ selectedButtons, onRemoveButton, onClear, voiceGender = 'female', profileId, userId = 'default' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (selectedButtons.length === 0 || isSpeaking) return;

    const phrase = selectedButtons.map(btn => btn.text).join(' ');
    
    setIsSpeaking(true);
    try {
      // Usar el nuevo servicio TTS mejorado con preferencias de usuario
      await enhancedTtsService.speak(phrase, {
        voiceGender: voiceGender,
        userId: userId || profileId || 'default'
      });
      
      // Agregar a frases recientes
      addToRecentPhrases(phrase);
      
      // Registrar frase en estadísticas
      if (profileId) {
        await recordPhraseCreated(profileId, phrase);
      }
    } catch (error) {
      console.error('Error al reproducir frase:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  if (selectedButtons.length === 0) {
    return null; // No mostrar nada si no hay botones seleccionados
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Frase construida - Responsive */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap max-h-32 sm:max-h-40 overflow-y-auto">
          {selectedButtons.map((button, index) => (
            <div
              key={`${button.id}-${index}`}
              className="relative group bg-blue-50 border-4 border-blue-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 touch-manipulation"
            >
              {button.image_url && (
                <img 
                  src={button.image_url} 
                  alt={button.text}
                  className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                />
              )}
              <span className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">
                {button.text}
              </span>
              <button
                onClick={() => onRemoveButton(index)}
                className="ml-1 sm:ml-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition-colors touch-manipulation"
              >
                <X size={18} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          ))}
        </div>

        {/* Botones de acción - MÁS GRANDES */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`
              flex-1 flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-6 rounded-2xl text-white font-bold text-xl sm:text-2xl
              ${ isSpeaking 
                ? 'bg-green-600 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
              disabled:opacity-75 transition-all touch-manipulation shadow-lg hover:shadow-xl border-4 border-transparent active:border-white
            `}
          >
            <Volume2 size={32} className={`sm:w-12 sm:h-12`} />
            <span>{isSpeaking ? 'Hablando...' : 'DECIR FRASE'}</span>
          </button>

          <button
            onClick={onClear}
            className="px-4 sm:px-6 py-4 sm:py-6 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold transition-colors flex items-center gap-2 sm:gap-3 touch-manipulation shadow-lg hover:shadow-xl text-xl sm:text-2xl border-4 border-transparent active:border-white"
          >
            <Trash2 size={28} className="sm:w-10 sm:h-10" />
            <span className="hidden sm:inline">BORRAR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
