import { useState } from 'react';
import { Volume2, StopCircle } from 'lucide-react';
import { audioPlayerService } from '../../services/audioPlayerService';

export default function StoryButton({ button }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (isPlaying) {
      audioPlayerService.stop();
      return;
    }

    audioPlayerService.play(button.audio_url, {
      onPlay: () => setIsPlaying(true),
      onStop: () => setIsPlaying(false)
    });
  };

  return (
    <div className="relative w-full aspect-square">
      <button
        onClick={handlePlay}
        className={`
          relative w-full h-full rounded-2xl overflow-hidden
          transition-all duration-200 transform
          ${isPlaying 
            ? 'scale-95 ring-8 ring-success' 
            : 'hover:scale-105 border-8 border-gray-800 hover:border-success'
          }
          focus:outline-none focus:ring-8 focus:ring-success
          shadow-2xl
        `}
        aria-label={isPlaying ? 'Detener historia' : button.text}
      >
        {/* Image Background */}
        {button.image_url && (
          <img
            src={button.image_url}
            alt={button.text}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-white font-bold text-4xl md:text-5xl lg:text-6xl text-center drop-shadow-2xl leading-tight">
            {button.text}
          </p>
        </div>

        {/* Play/Stop Icon */}
        <div className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          ${isPlaying ? 'bg-danger' : 'bg-success'}
          rounded-full p-8 shadow-2xl
          ${isPlaying ? 'animate-pulse' : ''}
        `}>
          {isPlaying ? (
            <StopCircle className="w-20 h-20 text-white" />
          ) : (
            <Volume2 className="w-20 h-20 text-white" />
          )}
        </div>
      </button>

      {/* Large STOP button overlay when playing */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
          <button
            onClick={handlePlay}
            className="bg-danger hover:bg-danger-dark text-white font-bold 
                       text-6xl px-16 py-12 rounded-3xl shadow-2xl
                       transition-all transform hover:scale-105
                       focus:outline-none focus:ring-8 focus:ring-danger"
          >
            <StopCircle className="w-24 h-24 inline-block mr-4" />
            DETENER
          </button>
        </div>
      )}
    </div>
  );
}
