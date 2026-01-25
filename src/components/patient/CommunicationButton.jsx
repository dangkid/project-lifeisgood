import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { ttsService } from '../../services/ttsService';

export default function CommunicationButton({ button, onClick, size = 'large', isScanning = false }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sizeClasses = {
    small: 'text-sm sm:text-base p-2 min-h-[100px]',
    medium: 'text-base sm:text-xl p-3 sm:p-4 min-h-[120px]',
    large: 'text-lg sm:text-2xl p-4 sm:p-6 min-h-[140px] sm:min-h-[180px]',
    xlarge: 'text-xl sm:text-3xl p-5 sm:p-8 min-h-[180px] sm:min-h-[220px]'
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
        relative w-full rounded-2xl bg-white
        border-4 transition-all duration-200 touch-manipulation
        flex flex-col items-center justify-center gap-3 sm:gap-4
        shadow-lg hover:shadow-xl active:shadow-md
        ${sizeClasses[size]}
        ${ isSpeaking 
          ? 'border-green-500 bg-green-50 scale-95' 
          : isScanning 
            ? 'border-yellow-500 bg-yellow-50 ring-8 ring-yellow-400 scale-110'
            : 'border-gray-400 hover:border-blue-500 active:border-blue-600 hover:bg-blue-50 active:scale-95'
        }
        disabled:opacity-75
      `}
    >
      {/* Imagen grande y clara */}
      {button.image_url && (
        <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
          <img
            src={button.image_url}
            alt={button.text}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Texto grande y legible */}
      <span className="font-bold text-gray-900 text-center leading-tight px-2">
        {button.text}
      </span>

      {/* Icono de sonido */}
      {isSpeaking && (
        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
          <Volume2 size={24} className="animate-pulse" />
        </div>
      )}
      
      {/* Indicador de toque */}
      <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-0 active:opacity-20 transition-opacity pointer-events-none"></div>
    </button>
  );
}
