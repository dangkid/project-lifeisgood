/**
 * Componente de Predicción de Palabras
 * Sugiere palabras mientras escribe
 */

import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { predictionService } from '../services/predictionService';

export default function PredictionHelper({ currentPhrase, onSelectPrediction, availableWords = [] }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (currentPhrase.trim().length > 0) {
      const predictions = predictionService.getAutocompleteSuggestions(
        currentPhrase,
        availableWords
      );
      setSuggestions(predictions);
    } else {
      setSuggestions([]);
    }
  }, [currentPhrase, availableWords]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={18} className="text-yellow-500" />
        <span className="font-semibold text-sm">Sugerencias</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrediction(suggestion)}
            className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors font-semibold"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
