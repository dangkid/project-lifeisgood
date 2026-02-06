/**
 * Servicio Mejorado de Predicción de Palabras
 * Predice palabras/frases basado en contexto e historial
 */

class EnhancedPredictionService {
  /**
   * Obtener predicciones basadas en entrada parcial
   */
  getPredictions(inputText, wordFrequency = {}, recentPhrases = []) {
    const input = inputText.toLowerCase().trim();
    
    if (input.length < 2) return [];

    const predictions = [];

    // 1. Buscar en palabras frecuentes
    Object.entries(wordFrequency).forEach(([word, count]) => {
      if (word.toLowerCase().startsWith(input) && count > 0) {
        predictions.push({
          text: word,
          type: 'frequent',
          score: count,
          confidence: Math.min(count / 10, 1)
        });
      }
    });

    // 2. Buscar en frases recientes
    recentPhrases.forEach(phrase => {
      if (phrase.toLowerCase().startsWith(input)) {
        predictions.push({
          text: phrase,
          type: 'recent',
          score: 5,
          confidence: 0.8
        });
      }
    });

    // 3. Ordenar por score y retornar top 5
    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(pred => ({
        ...pred,
        highlighted: this.highlightMatch(pred.text, input)
      }));
  }

  /**
   * Obtener palabras sugeridas para continuar una frase
   */
  getSuggestedContinuation(currentPhrase, wordFrequency = {}) {
    const words = currentPhrase.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];

    const suggestions = Object.entries(wordFrequency)
      .filter(([word]) => word.startsWith(lastWord))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word, count]) => ({
        text: word,
        confidence: Math.min(count / 10, 1),
        type: 'continuation'
      }));

    return suggestions;
  }

  /**
   * Resaltar la parte coincidente
   */
  highlightMatch(text, input) {
    const regex = new RegExp(`^(${input})`, 'i');
    return text.replace(regex, '<strong>$1</strong>');
  }

  /**
   * Obtener palabras por contexto
   */
  getContextualSuggestions(context, words = {}) {
    const contextKeywords = {
      medical: ['dolor', 'medicina', 'doctor', 'hospital', 'síntoma', 'ayuda'],
      school: ['maestra', 'clase', 'tarea', 'libro', 'aprender', 'pregunta'],
      home: ['mamá', 'papá', 'casa', 'comida', 'jugar', 'cama'],
      social: ['hola', 'amigo', 'gracias', 'por favor', 'adiós', 'te quiero']
    };

    const keywords = contextKeywords[context] || [];
    
    return keywords
      .filter(keyword => keyword in words)
      .map(keyword => ({
        text: keyword,
        confidence: Math.min(words[keyword] / 10, 1),
        type: 'contextual'
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detección de patrones de escritura
   */
  detectPatterns(recentCommunications) {
    const patterns = {};

    recentCommunications.forEach(comm => {
      const words = comm.text.toLowerCase().split(' ');
      
      for (let i = 0; i < words.length - 1; i++) {
        const pair = `${words[i]} ${words[i + 1]}`;
        patterns[pair] = (patterns[pair] || 0) + 1;
      }
    });

    return patterns;
  }

  /**
   * Obtener predicción inteligente
   */
  getSmartPredictions(input, userData) {
    const {
      wordFrequency = {},
      recentPhrases = [],
      patterns = {},
      context = 'home'
    } = userData;

    let allPredictions = [];

    // 1. Desde autocomplete
    allPredictions.push(...this.getPredictions(input, wordFrequency, recentPhrases));

    // 2. Desde sugerencias contextuales
    if (input.length === 0) {
      allPredictions.push(...this.getContextualSuggestions(context, wordFrequency));
    }

    // Eliminar duplicados y reordenar
    const seen = new Set();
    return allPredictions
      .filter(pred => {
        if (seen.has(pred.text)) return false;
        seen.add(pred.text);
        return true;
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }
}

export const enhancedPredictionService = new EnhancedPredictionService();
