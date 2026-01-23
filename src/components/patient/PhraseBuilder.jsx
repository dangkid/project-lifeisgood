import { useState } from 'react';
import { Volume2, X, Trash2 } from 'lucide-react';
import { ttsService } from '../../services/ttsService';

export default function PhraseBuilder({ selectedButtons, onRemoveButton, onClear, voiceGender = 'female' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (selectedButtons.length === 0 || isSpeaking) return;

    const phrase = selectedButtons.map(btn => btn.text).join(' ');
    
    setIsSpeaking(true);
    try {
      await ttsService.speak(phrase, voiceGender);
    } catch (error) {
      console.error('Error al reproducir frase:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  if (selectedButtons.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t-4 border-gray-300 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-xl">
          Selecciona botones para construir una frase
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-primary shadow-2xl z-40">
      <div className="max-w-7xl mx-auto p-4">
        {/* Frase construida */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {selectedButtons.map((button, index) => (
            <div
              key={`${button.id}-${index}`}
              className="relative group bg-blue-100 rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-blue-200 transition-all"
            >
              {button.image_url && (
                <img 
                  src={button.image_url} 
                  alt={button.text}
                  className="w-10 h-10 object-cover rounded"
                />
              )}
              <span className="text-xl font-semibold text-gray-800">
                {button.text}
              </span>
              <button
                onClick={() => onRemoveButton(index)}
                className="ml-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`
              flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-white font-bold text-2xl
              transition-all transform
              ${isSpeaking 
                ? 'bg-green-600 scale-95' 
                : 'bg-primary hover:bg-primary-dark hover:scale-105'
              }
              disabled:opacity-75 shadow-lg
            `}
          >
            <Volume2 size={32} className={isSpeaking ? 'animate-pulse' : ''} />
            {isSpeaking ? 'Reproduciendo...' : 'Decir Frase'}
          </button>

          <button
            onClick={onClear}
            className="px-6 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xl transition-all hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <Trash2 size={24} />
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
