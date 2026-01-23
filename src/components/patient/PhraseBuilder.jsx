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
      <div className="max-w-7xl mx-auto p-4">
        {/* Frase construida */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {selectedButtons.map((button, index) => (
            <div
              key={`${button.id}-${index}`}
              className="relative group bg-blue-50 border-2 border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              {button.image_url && (
                <img 
                  src={button.image_url} 
                  alt={button.text}
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <span className="text-lg font-medium text-gray-800">
                {button.text}
              </span>
              <button
                onClick={() => onRemoveButton(index)}
                className="ml-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-white font-bold text-xl
              ${isSpeaking 
                ? 'bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
              }
              disabled:opacity-75 transition-colors
            `}
          >
            <Volume2 size={24} className={isSpeaking ? 'animate-pulse' : ''} />
            {isSpeaking ? 'Reproduciendo...' : 'Decir Frase'}
          </button>

          <button
            onClick={onClear}
            className="px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center gap-2"
          >
            <Trash2 size={20} />
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
