import { useState } from 'react';
import { Volume2, Heart, Utensils, Droplets, AlertCircle, BedDouble, Thermometer, Smile, Frown, HelpCircle } from 'lucide-react';
import { ttsService } from '../../services/ttsService';
import { recordPhraseCreated } from '../../services/profileService';
import { addToRecentPhrases } from './RecentPhrases';

const QUICK_PHRASES = [
  { text: 'Tengo hambre', icon: Utensils, color: 'bg-orange-500', category: 'necesidad' },
  { text: 'Tengo sed', icon: Droplets, color: 'bg-blue-500', category: 'necesidad' },
  { text: 'Necesito ir al baño', icon: BedDouble, color: 'bg-purple-500', category: 'necesidad' },
  { text: 'Me duele', icon: AlertCircle, color: 'bg-red-500', category: 'dolor' },
  { text: 'Tengo frío', icon: Thermometer, color: 'bg-cyan-500', category: 'sensacion' },
  { text: 'Tengo calor', icon: Thermometer, color: 'bg-red-400', category: 'sensacion' },
  { text: 'Estoy feliz', icon: Smile, color: 'bg-yellow-400', category: 'emocion' },
  { text: 'Estoy triste', icon: Frown, color: 'bg-gray-600', category: 'emocion' },
  { text: 'Te quiero', icon: Heart, color: 'bg-pink-500', category: 'emocion' },
  { text: 'Ayuda', icon: HelpCircle, color: 'bg-red-600', category: 'emergencia' },
  { text: 'Sí', icon: Smile, color: 'bg-green-500', category: 'basico' },
  { text: 'No', icon: Frown, color: 'bg-red-500', category: 'basico' },
];

export default function QuickAccessPanel({ profileId, voiceGender = 'female' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpoken, setLastSpoken] = useState(null);

  const handleQuickPhrase = async (phrase) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    setLastSpoken(phrase.text);
    
    try {
      await ttsService.speak(phrase.text, voiceGender);
      
      // Agregar a frases recientes
      addToRecentPhrases(phrase.text);
      
      // Registrar en estadísticas
      if (profileId) {
        await recordPhraseCreated(profileId, phrase.text);
      }

      // Vibración de feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error) {
      console.error('Error al reproducir:', error);
    } finally {
      setIsSpeaking(false);
      setTimeout(() => setLastSpoken(null), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-600" />
          Acceso Rápido
        </h3>
        {lastSpoken && (
          <span className="text-xs text-green-600 font-medium animate-pulse">
            ✓ "{lastSpoken}"
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {QUICK_PHRASES.map((phrase, index) => {
          const Icon = phrase.icon;
          return (
            <button
              key={index}
              onClick={() => handleQuickPhrase(phrase)}
              disabled={isSpeaking}
              className={`${phrase.color} hover:opacity-90 active:scale-95 text-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl min-h-[120px] border-4 border-transparent active:border-white`}
            >
              <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
              <span className="text-base sm:text-xl font-bold text-center leading-tight">
                {phrase.text}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Toca cualquier frase para comunicarte rápidamente
      </p>
    </div>
  );
}
