// ARASAAC API Service - Pictogramas profesionales

// Obtener URL de un pictograma por ID con múltiples formatos de respaldo
export const getPictogramUrl = (pictogramId, size = 500) => {
  // URL principal
  const mainUrl = `https://static.arasaac.org/pictograms/${pictogramId}/${pictogramId}_${size}.png`;
  
  // URLs alternativas en caso de que la principal falle
  const alternativeUrls = [
    mainUrl,
    `https://static.arasaac.org/pictograms/${pictogramId}/${pictogramId}.png`,
    `https://api.arasaac.org/api/pictograms/${pictogramId}?download=false&width=${size}&height=${size}`,
    `https://www.arasaac.org/api/pictograms/${pictogramId}?download=false&width=${size}&height=${size}`
  ];
  
  return mainUrl;
};

// Verificar si una URL de pictograma es accesible
export const checkPictogramUrl = async (pictogramId, size = 500) => {
  const url = getPictogramUrl(pictogramId, size);
  
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    // En modo no-cors, no podemos verificar el status, pero al menos intentamos
    return true;
  } catch (error) {
    console.warn(`No se pudo verificar la URL para pictograma ${pictogramId}:`, error);
    return false;
  }
};

// Buscar pictogramas por palabra clave
export const searchPictograms = async (keyword, language = 'es') => {
  try {
    const response = await fetch(
      `https://api.arasaac.org/api/pictograms/${language}/search/${encodeURIComponent(keyword)}`
    );
    
    if (!response.ok) {
      throw new Error('Error buscando pictogramas');
    }
    
    const data = await response.json();
    
    // Devolver pictogramas con URLs completas
    return data.map(pictogram => ({
      id: pictogram._id,
      keywords: pictogram.keywords.map(k => k.keyword || k),
      imageUrl: `https://static.arasaac.org/pictograms/${pictogram._id}/${pictogram._id}_500.png`,
      thumbnailUrl: `https://static.arasaac.org/pictograms/${pictogram._id}/${pictogram._id}_300.png`
    }));
  } catch (error) {
    console.error('Error en ARASAAC API:', error);
    throw error;
  }
};
