import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Volume2, Users, Sparkles, ArrowRight, Heart, Settings, Menu, X, User, Zap, BarChart3, Newspaper, Calendar, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isUserAdmin } from '../services/authService';
import { getNews } from '../services/newsService';

export default function LandingPage({ user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Inicialmente false, se actualiza después
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('checkAdminStatus llamado, user:', user ? 'presente' : 'ausente');
      
      if (!user) {
        console.log('No hay usuario, estableciendo isAdmin = false');
        setIsAdmin(false);
        setLoadingAdmin(false);
        return;
      }
      
      setLoadingAdmin(true);
      try {
        console.log('Verificando estado de administrador...');
        const adminStatus = await isUserAdmin();
        console.log('Resultado de isUserAdmin:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error verificando rol de administrador:', error);
        setIsAdmin(false);
      } finally {
        setLoadingAdmin(false);
        console.log('Estado final de isAdmin:', isAdmin, 'loadingAdmin:', false);
      }
    };

    const loadNews = async () => {
      setLoadingNews(true);
      try {
        const newsData = await getNews(4); // Obtener 4 noticias
        setNews(newsData);
      } catch (error) {
        console.error('Error cargando noticias:', error);
      } finally {
        setLoadingNews(false);
      }
    };

    checkAdminStatus();
    loadNews();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar Mejorado - Responsive */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AAC Comunicador
                </h1>
                <p className="text-xs text-gray-500">Comunicación para todos</p>
              </div>
              <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AAC
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/comunicador"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/comunicador')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageCircle size={18} />
                <span>Comunicador</span>
              </Link>
              
              {/* Enlaces educativos - mostrados para todos, pero con indicación si no está autenticado */}
              <div className="flex items-center gap-2">
                <Link
                  to={user ? "/panel-educativo" : "/admin/login"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all group relative ${
                    isActive('/panel-educativo')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!user ? "Inicia sesión para acceder al panel educativo" : ""}
                >
                  <Sparkles size={18} />
                  <span>Panel Educativo</span>
                  {!user && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                      🔒
                    </span>
                  )}
                </Link>
                
                <Link
                  to={user ? "/juegos" : "/admin/login"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all group relative ${
                    isActive('/juegos')
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!user ? "Inicia sesión para acceder a los juegos" : ""}
                >
                  <Zap size={18} />
                  <span>Juegos</span>
                  {!user && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                      🔒
                    </span>
                  )}
                </Link>
                
                <Link
                  to={user ? "/progreso" : "/admin/login"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all group relative ${
                    isActive('/progreso')
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!user ? "Inicia sesión para ver tu progreso" : ""}
                >
                  <BarChart3 size={18} />
                  <span>Progreso</span>
                  {!user && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                      🔒
                    </span>
                  )}
                </Link>
              </div>
                
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-medium">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <Users size={18} />
                      <span>Panel Admin</span>
                    </Link>
                  ) : (
                    <Link
                      to="/perfil"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <User size={18} />
                      <span>Mi Perfil</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/admin/login"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Registrarse Gratis
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-2">
                <Link
                  to="/comunicador"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive('/comunicador')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle size={18} />
                  <span>Comunicador</span>
                </Link>
                
                {/* Enlaces educativos - mostrados para todos, con indicación de bloqueo */}
                <Link
                  to={user ? "/panel-educativo" : "/admin/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive('/panel-educativo')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Sparkles size={18} />
                  <span>Panel Educativo</span>
                  {!user && <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">🔒</span>}
                </Link>
                
                <Link
                  to={user ? "/juegos" : "/admin/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive('/juegos')
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Zap size={18} />
                  <span>Juegos</span>
                  {!user && <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">🔒</span>}
                </Link>
                
                <Link
                  to={user ? "/progreso" : "/admin/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive('/progreso')
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Progreso</span>
                  {!user && <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">🔒</span>}
                </Link>
                
                {user ? (
                  <>
                    <div className="px-4 py-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">Conectado como</p>
                      <p className="text-sm font-medium text-green-700">
                        {user.displayName || user.email}
                      </p>
                    </div>
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 justify-center"
                      >
                        <Users size={18} />
                        <span>Panel Admin</span>
                      </Link>
                    ) : (
                      <Link
                        to="/perfil"
                        onClick={() => setMobileMenuOpen(false)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 justify-center"
                      >
                        <User size={18} />
                        <span>Mi Perfil</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-700 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                    >
                      Registrarse Gratis
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 hover:border-blue-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 hover:border-purple-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-md">
              <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 hover:border-green-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-md">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
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

      {/* Advanced Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl my-12">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Características Avanzadas
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre todas las herramientas que hacen de nuestro sistema AAC la mejor opción para la comunicación aumentativa.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Juegos Educativos</h4>
            <p className="text-sm text-gray-600">Actividades interactivas para mejorar habilidades de comunicación y lenguaje.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Seguimiento de Progreso</h4>
            <p className="text-sm text-gray-600">Monitorea el desarrollo y avances con gráficos y estadísticas detalladas.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Panel de Administración</h4>
            <p className="text-sm text-gray-600">Gestiona usuarios, organizaciones y personaliza la experiencia para cada paciente.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Acceso Seguro</h4>
            <p className="text-sm text-gray-600">Protección de datos y privacidad garantizada con autenticación avanzada.</p>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Noticias Actualizadas
            </h3>
            <p className="text-gray-600">
              Mantente informado sobre los últimos avances en comunicación aumentativa y discapacidad.
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Newspaper size={20} />
            <span>Ver todas</span>
          </div>
        </div>
        
        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                <div className="h-40 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
                <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-blue-600" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar size={14} />
                      {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.source}</span>
                    <a
                      href={item.url}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Leer más
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
            <Newspaper size={18} />
            Suscribirse al boletín de noticias
          </button>
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
                <div className="text-blue-100 text-sm sm:text-base">Soporte</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">100%</div>
                <div className="text-blue-100 text-sm sm:text-base">Accesible</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AAC Comunicador</h2>
                  <p className="text-gray-400">Comunicación para todos</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Sistema de Comunicación Aumentativa y Alternativa diseñado para empoderar
                a personas con dificultades del habla y lenguaje.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/comunicador" className="text-gray-400 hover:text-white transition-colors">Comunicador</Link></li>
                <li><Link to="/panel-educativo" className="text-gray-400 hover:text-white transition-colors">Panel Educativo</Link></li>
                <li><Link to="/juegos" className="text-gray-400 hover:text-white transition-colors">Juegos Educativos</Link></li>
                <li><Link to="/progreso" className="text-gray-400 hover:text-white transition-colors">Seguimiento de Progreso</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><Link to="/consejos" className="text-gray-400 hover:text-white transition-colors">Consejos para Padres</Link></li>
                <li><Link to="/configuracion" className="text-gray-400 hover:text-white transition-colors">Configuración</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Términos de Servicio</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} AAC Comunicador - Life is Good. Todos los derechos reservados.</p>
            <p className="mt-2">Hecho con ❤️ para la comunidad de comunicación aumentativa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
