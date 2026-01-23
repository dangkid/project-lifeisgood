import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { ttsService } from '../../services/ttsService';

export default function CommunicationButton({ button, onClick }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleClick = async () => {
    // Si hay onClick (para construcción de frases), usarlo
    if (onClick) {
      onClick(button);
      return;
    }

    // Sino, reproducir directamente
    if (isSpeaking) return;

    setIsSpeaking(true);
    try {
      await ttsService.speak(button.text, button.voice_gender || 'female');
    } catch (error) {
      console.error('Error speaking:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSpeaking}
      className={`
        relative w-full aspect-square rounded-xl overflow-hidden bg-white
        border-4 transition-all
        ${isSpeaking 
          ? 'border-blue-500 shadow-lg scale-95' 
          : 'border-gray-300 hover:border-blue-400 hover:shadow-md active:scale-95'
        }
        disabled:opacity-75
      `}
    >
      {/* Imagen */}
      {button.image_url && (
        <img
          src={button.image_url}
          alt={button.text}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Texto */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3">
        <p className="text-gray-800 font-bold text-lg text-center leading-tight">
          {button.text}
        </p>
      </div>

      {/* Icono de sonido */}
      {isSpeaking && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-2">
          <Volume2 size={20} className="animate-pulse" />
        </div>
      )}
    </button>
  );
}
