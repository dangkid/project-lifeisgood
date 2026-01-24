import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { ttsService } from '../../services/ttsService';

export default function CommunicationButton({ button, onClick, size = 'medium' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sizeClasses = {
    small: 'text-xs sm:text-sm p-2',
    medium: 'text-base sm:text-lg p-2 sm:p-3',
    large: 'text-xl sm:text-2xl p-3 sm:p-4',
    xlarge: 'text-2xl sm:text-4xl p-4 sm:p-6'
  };

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
        border-4 transition-all touch-manipulation
        ${ isSpeaking 
          ? 'border-blue-500 shadow-lg scale-95' 
          : 'border-gray-300 hover:border-blue-400 hover:shadow-md active:scale-95 active:border-blue-500'
        }
        disabled:opacity-75
        min-h-[100px] sm:min-h-[120px]
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

      {/* Texto - Responsive */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-1.5 sm:p-2`}>
        <p className="text-gray-800 font-bold text-center leading-tight text-sm sm:text-base md:text-lg">
          {button.text}
        </p>
      </div>

      {/* Icono de sonido - Responsive */}
      {isSpeaking && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-blue-500 text-white rounded-full p-1.5 sm:p-2">
          <Volume2 size={16} className="sm:w-5 sm:h-5 animate-pulse" />
        </div>
      )}
    </button>
  );
}
