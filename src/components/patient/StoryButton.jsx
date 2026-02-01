import { useState, useEffect } from 'react';
import { Volume2, StopCircle, ExternalLink } from 'lucide-react';
import { audioPlayerService } from '../../services/audioPlayerService';

export default function StoryButton({ button }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSoundCloudPlayer, setShowSoundCloudPlayer] = useState(false);
  const [isSoundCloud, setIsSoundCloud] = useState(false);

  // Detectar si es una URL de SoundCloud
  useEffect(() => {
    if (button.audio_url && button.audio_url.includes('soundcloud.com')) {
      setIsSoundCloud(true);
    }
  }, [button.audio_url]);

  const handlePlay = () => {
    if (isSoundCloud) {
      // Para SoundCloud, mostrar el reproductor embebido
      setShowSoundCloudPlayer(!showSoundCloudPlayer);
      return;
    }

    // Para audio directo (mp3, wav, etc)
    if (isPlaying) {
      audioPlayerService.stop();
      setIsPlaying(false);
      return;
    }

    audioPlayerService.play(button.audio_url, {
      onPlay: () => setIsPlaying(true),
      onStop: () => setIsPlaying(false)
    });
  };

  return (
    <>
      {/* Modal del reproductor SoundCloud */}
      {showSoundCloudPlayer && isSoundCloud && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{button.text}</h3>
              <button
                onClick={() => setShowSoundCloudPlayer(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ✕
              </button>
            </div>
            
            {/* Widget de SoundCloud embebido */}
            <div className="rounded-2xl overflow-hidden bg-gray-100">
              <iframe
                width="100%"
                height="300"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(button.audio_url)}&color=%23FF5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
                className="w-full"
              />
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowSoundCloudPlayer(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cerrar
              </button>
              <a
                href={button.audio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-success hover:bg-success-dark text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={20} />
                Abrir en SoundCloud
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Botón principal */}
      <div className="relative w-full aspect-square">
        <button
          onClick={handlePlay}
          className={`
            relative w-full h-full rounded-2xl overflow-hidden
            transition-all duration-200 transform
            ${(isPlaying || showSoundCloudPlayer)
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
            ${isPlaying || showSoundCloudPlayer ? 'bg-danger' : 'bg-success'}
            rounded-full p-8 shadow-2xl
            ${isPlaying || showSoundCloudPlayer ? 'animate-pulse' : ''}
          `}>
            {isPlaying || showSoundCloudPlayer ? (
              <StopCircle className="w-20 h-20 text-white" />
            ) : (
              <Volume2 className="w-20 h-20 text-white" />
            )}
          </div>
        </button>

        {/* Large STOP button overlay when playing (solo para audio directo) */}
        {isPlaying && !isSoundCloud && (
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
    </>
  );
}
