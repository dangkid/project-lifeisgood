import { MessageCircle } from 'lucide-react';

export default function LoadingSpinner({ text = "Cargando", size = "large" }) {
  const sizes = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-24 h-24"
  };

  const iconSizes = {
    small: 32,
    medium: 64,
    large: 96
  };

  const textSizes = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animación de burbujas de comunicación */}
      <div className="relative">
        {/* Círculo exterior pulsante */}
        <div className="absolute inset-0 animate-ping">
          <div className={`${sizes[size]} rounded-full bg-blue-400 opacity-30`}></div>
        </div>
        
        {/* Círculo medio rotante */}
        <div className="absolute inset-0 animate-spin">
          <div className={`${sizes[size]} rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400`}></div>
        </div>
        
        {/* Icono central */}
        <div className={`${sizes[size]} flex items-center justify-center relative z-10`}>
          <MessageCircle 
            className="text-blue-600 animate-pulse" 
            size={iconSizes[size]}
            strokeWidth={2.5}
          />
        </div>
      </div>
      
      {/* Texto con animación de puntos */}
      <div className={`${textSizes[size]} font-bold text-gray-700`}>
        {text}...
      </div>
    </div>
  );
}
