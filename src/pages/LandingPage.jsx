import { Link } from 'react-router-dom';
import { MessageCircle, Volume2, Users, Sparkles, ArrowRight, Heart, Settings } from 'lucide-react';

export default function LandingPage({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar - Responsive */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800">AAC Comunicador</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/comunicador"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Comunicador</span>
              </Link>
              {user ? (
                <Link 
                  to="/especialista"
                  className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
                >
                  <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Panel de Especialista</span>
                  <span className="sm:hidden">Panel</span>
                </Link>
              ) : (
                <Link 
                  to="/especialista/login"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Responsive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Comunicación para Todos
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            Sistema de Comunicación Aumentativa y Alternativa (CAA) diseñado para personas 
            con dificultades del habla y lenguaje. Comunícate fácilmente usando pictogramas y voz.
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center px-4">
            <Link 
              to="/comunicador"
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all hover:shadow-lg flex items-center gap-2"
            >
              Comenzar Ahora
              <ArrowRight size={20} className="sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Responsive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
          ¿Cómo Funciona?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Pictogramas Visuales
            </h4>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Interfaz intuitiva con imágenes de ARASAAC que facilitan la comunicación visual 
              para expresar necesidades, emociones y pensamientos.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Síntesis de Voz
            </h4>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Cada botón reproduce el mensaje en voz alta con voces masculinas y femeninas, 
              permitiendo una comunicación efectiva y natural.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Constructor de Frases
            </h4>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Combina múltiples pictogramas para crear frases completas y expresar 
              ideas más complejas de forma sencilla.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section - Responsive */}
      <section className="bg-blue-600 text-white py-12 sm:py-16 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
              Diseñado con Amor y Accesibilidad
            </h3>
            <p className="text-base sm:text-xl leading-relaxed mb-6 sm:mb-8 px-2">
              Nuestro sistema AAC está pensado para personas con autismo, afasia, 
              parálisis cerebral, ELA y cualquier condición que afecte el habla. 
              Porque todos merecen tener voz.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center mt-8 sm:mt-12">
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">100%</div>
                <div className="text-blue-100 text-sm sm:text-base">Gratuito</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">24/7</div>
                <div className="text-blue-100 text-sm sm:text-base">Disponible</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">∞</div>
                <div className="text-blue-100 text-sm sm:text-base">Posibilidades</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h3 className="text-4xl font-bold text-gray-900 mb-6">
          ¿Listo para Comunicarte?
        </h3>
        <p className="text-xl text-gray-600 mb-8">
          Empieza a usar el comunicador ahora mismo. No requiere registro.
        </p>
        <Link 
          to="/comunicador"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all hover:shadow-lg"
        >
          Abrir Comunicador
          <ArrowRight size={24} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-6 h-6" />
                <h4 className="font-bold text-lg">AAC Comunicador</h4>
              </div>
              <p className="text-gray-400">
                Sistema de comunicación aumentativa y alternativa para todos.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/comunicador" className="hover:text-white transition-colors">
                    Comunicador
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-white transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Acerca de</h4>
              <p className="text-gray-400">
                Pictogramas de <a href="https://arasaac.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">ARASAAC</a>
                <br />
                Creado con ❤️ para la accesibilidad
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 AAC Comunicador. Sistema de comunicación accesible para todos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
