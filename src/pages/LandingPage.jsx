import { Link } from 'react-router-dom';
import { MessageCircle, Volume2, Users, Sparkles, ArrowRight, Heart, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">AAC Comunicador</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Inicio
              </Link>
              <Link 
                to="/comunicador"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                Comunicador
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/especialista/login"
                className="text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-2"
              >
                <Users size={18} />
                Especialista
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Comunicación para Todos
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Sistema de Comunicación Aumentativa y Alternativa (CAA) diseñado para personas 
            con dificultades del habla y lenguaje. Comunícate fácilmente usando pictogramas y voz.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/comunicador"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg flex items-center gap-2"
            >
              Usar Comunicador
              <ArrowRight size={24} />
            </Link>
            <Link 
              to="/especialista/login"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg flex items-center gap-2"
            >
              Acceso Especialista
              <Users size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          ¿Cómo Funciona?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Pictogramas Visuales
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Interfaz intuitiva con imágenes de ARASAAC que facilitan la comunicación visual 
              para expresar necesidades, emociones y pensamientos.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Volume2 className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Síntesis de Voz
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Cada botón reproduce el mensaje en voz alta con voces masculinas y femeninas, 
              permitiendo una comunicación efectiva y natural.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Constructor de Frases
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Combina múltiples pictogramas para crear frases completas y expresar 
              ideas más complejas de forma sencilla.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-600 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-6">
              Diseñado con Amor y Accesibilidad
            </h3>
            <p className="text-xl leading-relaxed mb-8">
              Nuestro sistema AAC está pensado para personas con autismo, afasia, 
              parálisis cerebral, ELA y cualquier condición que afecte el habla. 
              Porque todos merecen tener voz.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center mt-12">
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-blue-100">Gratuito</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Disponible</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">∞</div>
                <div className="text-blue-100">Posibilidades</div>
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
