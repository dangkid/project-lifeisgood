// Servicio para obtener noticias sobre comunicación aumentativa, discapacidad y educación
// Usamos NewsAPI (necesitarías una API key) o datos simulados para demostración

const NEWS_API_KEY = 'demo'; // En producción, usar una API key real
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Noticias simuladas para cuando no hay API key o para desarrollo
const mockNews = [
  {
    id: 1,
    title: 'Nuevas tecnologías en Comunicación Aumentativa y Alternativa',
    description: 'Investigadores desarrollan interfaces cerebro-computadora para personas con parálisis cerebral.',
    source: 'Tech Accessibility Journal',
    date: '2026-01-28',
    url: '#',
    category: 'Tecnología',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Estudio revela beneficios del uso temprano de pictogramas en niños con autismo',
    description: 'Investigación muestra mejoras significativas en habilidades comunicativas después de 6 meses de intervención.',
    source: 'Journal of Autism Research',
    date: '2026-01-25',
    url: '#',
    category: 'Investigación',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6956efb034?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'App gratuita de CAA supera el millón de descargas',
    description: 'La aplicación "AAC Comunicador" ayuda a miles de familias en todo el mundo a mejorar la comunicación.',
    source: 'Accessibility News',
    date: '2026-01-22',
    url: '#',
    category: 'Noticias',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'Talleres virtuales para terapeutas del habla y lenguaje',
    description: 'Capacitación gratuita sobre implementación de sistemas AAC en entornos educativos y clínicos.',
    source: 'Speech Therapy Association',
    date: '2026-01-20',
    url: '#',
    category: 'Educación',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'Nuevo protocolo para evaluación de necesidades de comunicación',
    description: 'Herramienta estandarizada ayuda a identificar el sistema AAC más adecuado para cada persona.',
    source: 'Communication Disorders Quarterly',
    date: '2026-01-18',
    url: '#',
    category: 'Herramientas',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'Comunidad online de apoyo para familias de personas con afasia',
    description: 'Plataforma conecta a cuidadores y profesionales para compartir recursos y experiencias.',
    source: 'Aphasia Community Network',
    date: '2026-01-15',
    url: '#',
    category: 'Comunidad',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

/**
 * Obtiene noticias actualizadas sobre comunicación aumentativa y discapacidad
 * @param {number} limit - Número máximo de noticias a devolver
 * @returns {Promise<Array>} Array de noticias
 */
export async function getNews(limit = 6) {
  try {
    // En producción, descomentar para usar NewsAPI real
    /*
    const response = await fetch(
      `${NEWS_API_URL}?q=augmentative+alternative+communication+disability&language=es&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Error fetching news');
    }
    
    const data = await response.json();
    return data.articles.slice(0, limit).map(article => ({
      id: article.url,
      title: article.title,
      description: article.description,
      source: article.source.name,
      date: article.publishedAt,
      url: article.url,
      category: 'Noticias',
      image: article.urlToImage || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    }));
    */
    
    // Por ahora, devolvemos noticias simuladas
    return mockNews.slice(0, limit);
  } catch (error) {
    console.error('Error fetching news:', error);
    // En caso de error, devolver noticias simuladas
    return mockNews.slice(0, limit);
  }
}

/**
 * Obtiene noticias por categoría
 * @param {string} category - Categoría de noticias
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Noticias filtradas por categoría
 */
export async function getNewsByCategory(category, limit = 4) {
  const allNews = await getNews(20); // Obtener más noticias para filtrar
  return allNews
    .filter(news => news.category === category)
    .slice(0, limit);
}

/**
 * Obtiene las noticias más recientes
 * @param {number} days - Número de días hacia atrás
 * @returns {Promise<Array>} Noticias recientes
 */
export async function getRecentNews(days = 7) {
  const allNews = await getNews(20);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return allNews.filter(news => {
    const newsDate = new Date(news.date);
    return newsDate >= cutoffDate;
  });
}