import { useState, useEffect } from 'react';
import { Clock, Volume2, X } from 'lucide-react';
import { ttsService } from '../../services/ttsService';

export default function RecentPhrases({ voiceGender = 'female' }) {
  const [recentPhrases, setRecentPhrases] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cargar frases recientes del localStorage
    const saved = localStorage.getItem('recentPhrases');
    if (saved) {
      setRecentPhrases(JSON.parse(saved));
    }
  }, []);

  const addPhrase = (phrase) => {
    const updated = [phrase, ...recentPhrases.filter(p => p !== phrase)].slice(0, 5);
    setRecentPhrases(updated);
    localStorage.setItem('recentPhrases', JSON.stringify(updated));
  };

  const handleSpeak = async (phrase) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await ttsService.speak(phrase, voiceGender);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const removePhrase = (phrase, e) => {
    e.stopPropagation();
    const updated = recentPhrases.filter(p => p !== phrase);
    setRecentPhrases(updated);
    localStorage.setItem('recentPhrases', JSON.stringify(updated));
  };

  if (recentPhrases.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Frases Recientes</h3>
      </div>
      
      <div className="space-y-2">
        {recentPhrases.map((phrase, index) => (
          <button
            key={index}
            onClick={() => handleSpeak(phrase)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1">
              <Volume2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left">{phrase}</span>
            </div>
            <button
              onClick={(e) => removePhrase(phrase, e)}
              className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-red-500 dark:text-red-400" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}

// Exportar la función para agregar frases desde otros componentes
export const addToRecentPhrases = (phrase) => {
  const saved = localStorage.getItem('recentPhrases');
  const current = saved ? JSON.parse(saved) : [];
  const updated = [phrase, ...current.filter(p => p !== phrase)].slice(0, 5);
  localStorage.setItem('recentPhrases', JSON.stringify(updated));
};
