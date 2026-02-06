import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { enhancedPredictionService } from '../services/enhancedPredictionService';

export default function EnhancedSearchBar({ 
  onSearch, 
  onSelect, 
  buttons = [],
  recentPhrases = [],
  wordFrequency = {},
  context = 'home'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      // Obtener predicciones
      const preds = enhancedPredictionService.getSmartPredictions(searchQuery, {
        wordFrequency,
        recentPhrases,
        context
      });
      setPredictions(preds);
      setShowPredictions(true);
    } else {
      // Si está vacío, mostrar palabras frecuentes
      if (searchQuery === '') {
        const frequent = Object.entries(wordFrequency || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([word, count]) => ({
            text: word,
            type: 'frequent',
            confidence: Math.min(count / 10, 1)
          }));
        setPredictions(frequent);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    }
  }, [searchQuery, wordFrequency, recentPhrases, context]);

  const handleSelectPrediction = (text) => {
    onSelect(text);
    setSearchQuery('');
    setPredictions([]);
    setShowPredictions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
      setShowPredictions(false);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowPredictions(true)}
            placeholder="Buscar palabras o frases..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPredictions([]);
                setShowPredictions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Predicciones/Sugerencias */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {predictions.map((pred, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPrediction(pred.text)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-gray-900 dark:text-gray-100">{pred.text}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {pred.type === 'frequent' && '⭐ Frecuente'}
                    {pred.type === 'recent' && '⏰ Reciente'}
                    {pred.type === 'contextual' && '🎯 Contextual'}
                  </div>
                </div>
                <div 
                  className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden"
                  title={`${Math.round(pred.confidence * 100)}%`}
                >
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${pred.confidence * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
