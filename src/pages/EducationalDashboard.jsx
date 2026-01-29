import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Target, TrendingUp, Clock, Users, Award, Lightbulb, ChevronRight } from 'lucide-react';

export default function EducationalDashboard({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Panel Educativo
                </h1>
                <p className="text-xs text-gray-500">Aprendizaje personalizado</p>
              </div>
              <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Educativo
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Inicio
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  {user?.displayName || user?.email?.split('@')[0] || 'Estudiante'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido al Panel Educativo!
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Este es tu centro de aprendizaje personalizado. Aquí encontrarás actividades, juegos y seguimiento de tu progreso.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">12</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Lecciones Completadas</h3>
            <p className="text-gray-600 text-sm">Sigue aprendiendo nuevas habilidades</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">85%</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Precisión</h3>
            <p className="text-gray-600 text-sm">Excelente desempeño en actividades</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">24</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Días de Racha</h3>
            <p className="text-gray-600 text-sm">¡Mantén la consistencia!</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">45 min</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tiempo Hoy</h3>
            <p className="text-gray-600 text-sm">Tiempo dedicado al aprendizaje</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/juegos"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-xl font-bold mb-2">Juegos Educativos</h4>
              <p className="text-blue-100">Aprende jugando con actividades interactivas</p>
            </Link>

            <Link
              to="/progreso"
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-xl font-bold mb-2">Ver Progreso</h4>
              <p className="text-green-100">Revisa tus estadísticas y logros</p>
            </Link>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Comunidad</h4>
              <p className="text-orange-100">Conecta con otros estudiantes</p>
            </div>
          </div>
        </div>

        {/* Learning Resources & Forum Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Tips Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900">Consejos & Recomendaciones</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Consistencia Diaria</h4>
                  <p className="text-gray-600">Incluso 15 minutos al día pueden mejorar significativamente las habilidades de comunicación con el tiempo.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Usa Apoyos Visuales</h4>
                  <p className="text-gray-600">Combina CAA con horarios visuales e historias sociales para una mejor comprensión.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-700 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Involucra a la Familia</h4>
                  <p className="text-gray-600">Practica la comunicación con diferentes personas en diversas situaciones reales.</p>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto">
              Ver más consejos
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Educational Forum Section */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Foro Educativo</h3>
            </div>
            <p className="mb-6 text-indigo-100">
              Conéctate con otros estudiantes, comparte experiencias y haz preguntas sobre comunicación aumentativa.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white/20 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <span className="font-bold">JS</span>
                  </div>
                  <div>
                    <h4 className="font-bold">¿Cómo enseñar verbos básicos?</h4>
                    <p className="text-sm text-indigo-200">Por Juan Sánchez · Hace 2 días</p>
                  </div>
                </div>
                <p className="text-sm">Estoy buscando actividades para enseñar verbos como "comer", "beber", "jugar" a mi hijo...</p>
              </div>
              
              <div className="bg-white/20 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <span className="font-bold">MP</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Recursos para adultos con afasia</h4>
                    <p className="text-sm text-indigo-200">Por María Pérez · Hace 5 días</p>
                  </div>
                </div>
                <p className="text-sm">Comparto mi experiencia usando el comunicador con mi padre que tiene afasia...</p>
              </div>
            </div>
            
            <button className="w-full bg-white text-indigo-600 hover:bg-gray-100 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <MessageSquare size={18} />
              Unirse al Foro
            </button>
          </div>
        </div>

        {/* Learning Resources */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Recursos de Aprendizaje</h3>
            </div>
            <Link to="/recursos" className="text-blue-600 hover:text-blue-800 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Guías para Padres</h4>
              <p className="text-gray-600 text-sm">Aprende cómo implementar CAA en casa con guías paso a paso.</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Videotutoriales</h4>
              <p className="text-gray-600 text-sm">Videos explicativos sobre cómo usar todas las funciones del comunicador.</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Biblioteca de Pictogramas</h4>
              <p className="text-gray-600 text-sm">Accede a miles de pictogramas de ARASAAC organizados por categorías.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}