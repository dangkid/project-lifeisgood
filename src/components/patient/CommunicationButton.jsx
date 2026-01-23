import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { ttsService } from '../../services/ttsService';

export default function CommunicationButton({ button, onClick }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = async () => {
    // Si hay un onClick externo (para construcción de frases), úsalo
    if (onClick) {
      onClick(button);
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 200);
      return;
    }

    // Sino, reproducir directamente
    if (isSpeaking) return;

    setIsSpeaking(true);
    setIsPressed(true);
    
    try {
      const gender = button.voice_gender || 'female';
      await ttsService.speak(button.text, gender);
    } catch (error) {
      console.error('Error speaking:', error);
    } finally {
      setIsSpeaking(false);
      setTimeout(() => setIsPressed(false), 200);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSpeaking}
      className={`
        relative w-full aspect-square rounded-2xl overflow-hidden
        transition-all duration-200 transform
        ${isPressed ? 'scale-90' : 'scale-100'}
        ${isSpeaking 
          ? 'ring-8 ring-primary ring-opacity-50 animate-pulse' 
          : 'hover:scale-105 border-8 border-gray-800 hover:border-primary hover:shadow-2xl'
        }
        disabled:opacity-75
        focus:outline-none focus:ring-8 focus:ring-primary
        shadow-2xl
        cursor-pointer active:scale-95
      `}
      aria-label={button.text}
    >
      {/* Image Background */}
      {button.image_url && (
        <img
          src={button.image_url}
          alt={button.text}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark Overlay for Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-white font-bold text-4xl md:text-5xl lg:text-6xl text-center drop-shadow-2xl leading-tight">
          {button.text}
        </p>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="absolute top-4 right-4 bg-primary rounded-full p-4 animate-pulse">
          <Volume2 className="w-12 h-12 text-white" />
        </div>
      )}
    </button>
  );
}
