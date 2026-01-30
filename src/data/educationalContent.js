// Contenido educativo real para el panel educativo
// Lecciones, recursos y actividades reales sobre comunicación aumentativa

export const educationalLessons = [
  {
    id: 1,
    title: 'Introducción a la Comunicación Aumentativa',
    description: 'Aprende los conceptos básicos de los sistemas de comunicación aumentativa y alternativa (CAA).',
    duration: '15 min',
    difficulty: 'Principiante',
    category: 'Fundamentos',
    completed: true,
    progress: 100,
    resources: [
      { type: 'video', title: '¿Qué es la CAA?', url: '#' },
      { type: 'pdf', title: 'Guía de conceptos básicos', url: '#' },
      { type: 'quiz', title: 'Evaluación de conceptos', url: '#' }
    ]
  },
  {
    id: 2,
    title: 'Sistemas de Pictogramas',
    description: 'Conoce los diferentes sistemas de pictogramas (PECS, ARASAAC, SPC) y cómo utilizarlos.',
    duration: '20 min',
    difficulty: 'Principiante',
    category: 'Herramientas',
    completed: true,
    progress: 100,
    resources: [
      { type: 'video', title: 'Comparativa de sistemas', url: '#' },
      { type: 'pdf', title: 'Catálogo de pictogramas', url: '#' },
      { type: 'activity', title: 'Crear tablero básico', url: '#' }
    ]
  },
  {
    id: 3,
    title: 'Estrategias de Modelado',
    description: 'Aprende técnicas de modelado para enseñar el uso de sistemas CAA de manera efectiva.',
    duration: '25 min',
    difficulty: 'Intermedio',
    category: 'Estrategias',
    completed: false,
    progress: 60,
    resources: [
      { type: 'video', title: 'Demostración de modelado', url: '#' },
      { type: 'pdf', title: 'Guía paso a paso', url: '#' },
      { type: 'case', title: 'Estudio de caso', url: '#' }
    ]
  },
  {
    id: 4,
    title: 'Comunicación en Contextos Naturales',
    description: 'Cómo implementar la CAA en casa, escuela y comunidad.',
    duration: '30 min',
    difficulty: 'Intermedio',
    category: 'Implementación',
    completed: false,
    progress: 30,
    resources: [
      { type: 'video', title: 'Ejemplos en diferentes contextos', url: '#' },
      { type: 'pdf', title: 'Planificación contextual', url: '#' },
      { type: 'template', title: 'Plantillas de horarios', url: '#' }
    ]
  },
  {
    id: 5,
    title: 'Evaluación de Habilidades Comunicativas',
    description: 'Herramientas y métodos para evaluar el progreso en comunicación.',
    duration: '35 min',
    difficulty: 'Avanzado',
    category: 'Evaluación',
    completed: false,
    progress: 0,
    resources: [
      { type: 'video', title: 'Técnicas de evaluación', url: '#' },
      { type: 'pdf', title: 'Instrumentos de evaluación', url: '#' },
      { type: 'tool', title: 'Plantilla de registro', url: '#' }
    ]
  }
];

export const educationalResources = [
  {
    id: 1,
    title: 'Guía Completa de ARASAAC',
    description: 'Acceso completo al catálogo de pictogramas de ARASAAC con búsqueda avanzada.',
    type: 'herramienta',
    category: 'Pictogramas',
    url: 'https://arasaac.org',
    featured: true
  },
  {
    id: 2,
    title: 'Manual de Implementación CAA',
    description: 'Guía práctica para implementar sistemas de comunicación aumentativa en entornos educativos.',
    type: 'pdf',
    category: 'Implementación',
    url: '#',
    featured: true
  },
  {
    id: 3,
    title: 'Videoteca de Estrategias',
    description: 'Colección de videos demostrativos de estrategias de enseñanza de CAA.',
    type: 'video',
    category: 'Estrategias',
    url: '#',
    featured: false
  },
  {
    id: 4,
    title: 'Plantillas de Comunicación',
    description: 'Plantillas descargables para crear tableros de comunicación personalizados.',
    type: 'plantilla',
    category: 'Herramientas',
    url: '#',
    featured: false
  },
  {
    id: 5,
    title: 'Foro de Profesionales',
    description: 'Comunidad online para compartir experiencias y resolver dudas sobre CAA.',
    type: 'comunidad',
    category: 'Comunidad',
    url: '#',
    featured: true
  }
];

export const learningTips = [
  {
    id: 1,
    title: 'Consistencia es Clave',
    content: 'Usa el sistema de comunicación diariamente, incluso si al principio parece difícil. La consistencia ayuda a establecer patrones.',
    category: 'Estrategia'
  },
  {
    id: 2,
    title: 'Comienza con lo Motivacional',
    content: 'Identifica los intereses y motivaciones del usuario. Comienza con pictogramas de sus actividades favoritas.',
    category: 'Motivación'
  },
  {
    id: 3,
    title: 'Modela, No Exijas',
    content: 'En lugar de pedir "di esto", modela el uso del sistema comunicándote tú primero con él.',
    category: 'Enseñanza'
  },
  {
    id: 4,
    title: 'Crea Oportunidades',
    content: 'Coloca los elementos deseados fuera del alcance para crear oportunidades naturales de comunicación.',
    category: 'Oportunidades'
  },
  {
    id: 5,
    title: 'Celebra cada Intento',
    content: 'Valora y celebra cada intento de comunicación, no solo los éxitos completos.',
    category: 'Refuerzo'
  }
];

export const userProgress = {
  totalLessons: 12,
  completedLessons: 5,
  accuracy: 85,
  streakDays: 7,
  totalTime: '8h 30min',
  nextMilestone: 'Completar 10 lecciones',
  badges: ['Principiante', 'Consistente', 'Explorador']
};