import { useState } from 'react';
import { Volume2, X, Trash2 } from 'lucide-react';
import { ttsService } from '../../services/ttsService';
import { recordPhraseCreated } from '../../services/profileService';

export default function PhraseBuilder({ selectedButtons, onRemoveButton, onClear, voiceGender = 'female', profileId }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (selectedButtons.length === 0 || isSpeaking) return;

    const phrase = selectedButtons.map(btn => btn.text).join(' ');
    
    setIsSpeaking(true);
    try {
      await ttsService.speak(phrase, voiceGender);
      
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg z-40">
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        {/* Frase construida - Responsive */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap max-h-32 sm:max-h-40 overflow-y-auto">
          {selectedButtons.map((button, index) => (
            <div
              key={`${button.id}-${index}`}
              className="relative group bg-blue-50 border-2 border-blue-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 touch-manipulation"
            >
              {button.image_url && (
                <img 
                  src={button.image_url} 
                  alt={button.text}
                  className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded flex-shrink-0"
                />
              )}
              <span className="text-sm sm:text-base md:text-lg font-medium text-gray-800">
                {button.text}
              </span>
              <button
                onClick={() => onRemoveButton(index)}
                className="ml-0.5 sm:ml-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 active:bg-red-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </div>
          ))}
        </div>

        {/* Botones de acción - Responsive */}
        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`
              flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg text-white font-bold text-base sm:text-xl
              ${ isSpeaking 
                ? 'bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
              }
              disabled:opacity-75 transition-colors touch-manipulation
            `}
          >
            <Volume2 size={20} className={`sm:w-6 sm:h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{isSpeaking ? 'Reproduciendo...' : 'Decir Frase'}</span>
            <span className="sm:hidden">{isSpeaking ? 'Hablando...' : 'Decir'}</span>
          </button>

          <button
            onClick={onClear}
            className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold transition-colors flex items-center gap-1 sm:gap-2 touch-manipulation"
          >
            <Trash2 size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Borrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
