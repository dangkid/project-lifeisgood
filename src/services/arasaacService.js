// ARASAAC API Service - Pictogramas profesionales
const ARASAAC_API_BASE = 'https://api.arasaac.org/api';

// Buscar pictogramas por palabra clave
export const searchPictograms = async (keyword, language = 'es') => {
  try {
    const response = await fetch(
      `${ARASAAC_API_BASE}/pictograms/${language}/search/${encodeURIComponent(keyword)}`
    );
    
    if (!response.ok) {
      throw new Error('Error buscando pictogramas');
    }
    
    const data = await response.json();
    
    // Devolver pictogramas con URLs completas
    return data.map(pictogram => ({
      id: pictogram._id,
      // Extraer solo las palabras clave (keywords viene como array de objetos)
      keywords: pictogram.keywords.map(k => k.keyword || k),
      // URL de la imagen en alta calidad
      imageUrl: `https://static.arasaac.org/pictograms/${pictogram._id}/${pictogram._id}_500.png`,
      // URL alternativa de menor calidad
      thumbnailUrl: `https://static.arasaac.org/pictograms/${pictogram._id}/${pictogram._id}_300.png`
    }));
  } catch (error) {
    console.error('Error en ARASAAC API:', error);
    throw error;
  }
};

// Obtener URL de un pictograma por ID
export const getPictogramUrl = (pictogramId, size = 500) => {
  return `https://static.arasaac.org/pictograms/${pictogramId}/${pictogramId}_${size}.png`;
};
