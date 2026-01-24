// Sistema simple de predicción de palabras
// Basado en frecuencia y contexto

const commonSequences = {
  'Hola': ['¿cómo', 'estoy', 'me', 'quiero'],
  'Quiero': ['agua', 'comer', 'ir', 'dormir', 'jugar'],
  'Tengo': ['hambre', 'sed', 'sueño', 'dolor', 'frío', 'calor'],
  'Me': ['duele', 'gusta', 'siento', 'voy'],
  'Necesito': ['ayuda', 'agua', 'ir', 'descansar'],
  'Estoy': ['bien', 'mal', 'cansado', 'feliz', 'triste'],
  '¿Puedo': ['ir', 'tener', 'hacer', 'salir'],
  'Ir': ['al', 'a', 'baño', 'casa', 'parque'],
};

const frequentWords = [
  'Sí', 'No', 'Por favor', 'Gracias',
  'Hola', 'Adiós', 'Ayuda', 'Agua',
  'Mamá', 'Papá', 'Dolor', 'Baño'
];

export const getPredictions = (currentPhrase, allButtons) => {
  if (!currentPhrase || currentPhrase.length === 0) {
    // Si no hay frase, sugerir palabras frecuentes
    return frequentWords.slice(0, 4);
  }

  // Obtener la última palabra
  const lastWord = currentPhrase[currentPhrase.length - 1].text;
  
  // Buscar predicciones basadas en la última palabra
  const predictions = commonSequences[lastWord] || [];
  
  // Completar con palabras frecuentes si no hay suficientes
  const result = [...predictions];
  for (const word of frequentWords) {
    if (result.length >= 4) break;
    if (!result.includes(word)) {
      result.push(word);
    }
  }
  
  return result.slice(0, 4);
};

export const findButtonByText = (text, buttons) => {
  return buttons.find(btn => 
    btn.text.toLowerCase() === text.toLowerCase()
  );
};
