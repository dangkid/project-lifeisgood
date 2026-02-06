import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Image, ArrowLeft, ExternalLink, Download, MessageCircle } from 'lucide-react';
import { educationalResources as resourcesData } from '../data/educationalContent';
import Navbar from '../components/Navbar';

export default function EducationalResources({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  // Organizamos los recursos por categoría
  const categoriesMap = {};
  resourcesData.forEach(resource => {
    if (!categoriesMap[resource.category]) {
      categoriesMap[resource.category] = [];
    }
    categoriesMap[resource.category].push(resource);
  });

  const categories = [
    { id: 'all', label: '📚 Todos', icon: BookOpen },
    { id: 'Pictogramas', label: '🖼️ Pictogramas', icon: Image },
    { id: 'Guías para Padres', label: '👨‍👩‍👧 Guías para Padres', icon: BookOpen },
    { id: 'Videotutoriales', label: '🎥 Videotutoriales', icon: Video },
    { id: 'Herramientas', label: '⚙️ Herramientas', icon: BookOpen },
    { id: 'Comunidad', label: '💬 Comunidad', icon: MessageCircle }
  ];

  const filteredResources = activeCategory === 'all' 
    ? resourcesData 
    : resourcesData.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar user={user} isTherapist={true} onLogout={onLogout} />

      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Volver</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recursos de Aprendizaje</h1>
              <p className="text-gray-600">Accede a guías, videos, pictogramas y herramientas para mejorar tu comunicación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Categorías */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-600 text-lg">No hay recursos en esta categoría aún.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-102 overflow-hidden"
              >
                {/* Card Content */}
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{resource.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {resource.title}
                        </h2>
                        <ExternalLink size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-gray-600 mb-4">{resource.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {resource.type}
                        </span>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {resource.category}
                        </span>
                        {resource.featured && (
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            ⭐ Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 sm:p-12 text-white">
          <div className="flex items-start gap-4 flex-col sm:flex-row">
            <MessageCircle className="w-8 h-8 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">¿Tienes preguntas?</h3>
              <p className="text-white text-opacity-90 mb-4">
                Consulta nuestro panel educativo interactivo con ejercicios prácticos, juegos educativos y comunidad.
              </p>
              <button
                onClick={() => navigate('/educational-dashboard')}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Ir al Panel Educativo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
