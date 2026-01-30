import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Volume2, Users, Sparkles, ArrowRight, Menu, X, User, LogOut, CheckCircle, GraduationCap, Gamepad2, Heart, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isUserAdmin, signOut, getUserRole } from '../services/authService';

export default function LandingPage({ user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin', 'therapist', 'user', o null
  const [loadingRole, setLoadingRole] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const checkUserRole = async () => {
      console.log('checkUserRole llamado, user:', user ? 'presente' : 'ausente');
      
      if (!user) {
        console.log('No hay usuario, estableciendo userRole = null');
        setUserRole(null);
        setLoadingRole(false);
        return;
      }
      
      setLoadingRole(true);
      try {
        console.log('Obteniendo rol del usuario...');
        const role = await getUserRole();
        console.log('Rol obtenido:', role);
        setUserRole(role || 'user'); // Si no tiene rol, por defecto 'user'
      } catch (error) {
        console.error('Error obteniendo rol del usuario:', error);
        setUserRole('user'); // Por defecto 'user' en caso de error
      } finally {
        setLoadingRole(false);
        console.log('Estado final de userRole:', userRole, 'loadingRole:', false);
      }
    };

    checkUserRole();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Profesional - Limpio y organizado */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ComunicaCentros</h1>
                <p className="text-xs text-gray-500">Comunicación Aumentativa</p>
              </div>
            </Link>

            {/* Desktop Navigation - Organizada por roles */}
            <div className="hidden md:flex items-center gap-6">
              {/* Enlaces principales */}
              <div className="flex items-center gap-1">
                <Link
                  to="/comunicador"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/comunicador')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Comunicador
                </Link>
                
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                    }`}
                  >
                    Centro
                  </Link>
                )}
                
                <Link
                  to={user ? "/panel-educativo" : "/admin/login"}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/panel-educativo')
                      ? 'bg-purple-50 text-purple-700'
                      : !user
                        ? 'text-gray-400'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                  title={!user ? "Inicia sesión para acceder al panel educativo" : ""}
                >
                  Panel Educativo
                </Link>
                
                <Link
                  to={user ? "/juegos" : "/admin/login"}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/juegos')
                      ? 'bg-orange-50 text-orange-700'
                      : !user
                        ? 'text-gray-400'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                  title={!user ? "Inicia sesión para acceder a los juegos" : ""}
                >
                  Juegos
                </Link>
              </div>
                
              {/* Sección derecha - Usuario */}
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-medium">
                          {user.displayName || user.email?.split('@')[0]}
                        </span>
                      </div>
                      {userRole === 'admin' ? (
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
                    <button
                      onClick={async () => {
                        try {
                          await signOut();
                        } catch (error) {
                          console.error('Error al cerrar sesión:', error);
                        }
                      }}
                      className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-50"
                      title="Cerrar sesión"
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/login"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
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
                  className="px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Comunicador
                </Link>
                
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Centro
                  </Link>
                )}
                
                <Link
                  to={user ? "/panel-educativo" : "/admin/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Panel Educativo
                </Link>
                
                <Link
                  to={user ? "/juegos" : "/admin/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Juegos
                </Link>
                
                {user && (
                  <>
                    {userRole === 'admin' ? (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Users size={18} />
                        <span>Panel Admin</span>
                      </Link>
                    ) : (
                      <Link
                        to="/perfil"
                        onClick={() => setMobileMenuOpen(false)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <User size={18} />
                        <span>Mi Perfil</span>
                      </Link>
                    )}
                    <div className="px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {user.displayName || user.email}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await signOut();
                              setMobileMenuOpen(false);
                            } catch (error) {
                              console.error('Error al cerrar sesión:', error);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Profesional y enfocada */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido de texto */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                <span>Sistema de Comunicación Aumentativa</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Comunicación <span className="text-blue-600">Accesible</span> para Todos
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Plataforma profesional de Comunicación Aumentativa y Alternativa (CAA) 
                diseñada para empoderar a personas con dificultades del habla y lenguaje. 
                Con pictogramas ARASAAC, síntesis de voz avanzada y herramientas educativas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/comunicador"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-3 justify-center group"
                >
                  <span>Probar Comunicador</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/registro"
                  className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
                >
                  <span>Crear Cuenta Gratis</span>
                </Link>
              </div>
              
              {/* Características rápidas */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Pictogramas ARASAAC</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Síntesis de Voz</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Juegos Educativos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Seguimiento de Progreso</span>
                </div>
              </div>
            </div>
            
            {/* Imagen ilustrativa */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <MessageCircle className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Comunicador AAC</h3>
                      <p className="text-blue-100">
                        Interfaz intuitiva para comunicación diaria
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">Demo Rápida</h4>
                      <p className="text-sm text-gray-600">Vea cómo funciona</p>
                    </div>
                    <Link
                      to="/comunicador"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      <ArrowRight size={18} />
                      <span>Probar</span>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Elementos decorativos sutiles */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-2xl -z-10"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-50 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Características <span className="text-blue-600">Principales</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Herramientas diseñadas específicamente para la comunicación aumentativa y el desarrollo del lenguaje
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Característica 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunicador Intuitivo</h3>
              <p className="text-gray-600 mb-4">
                Interfaz simple con pictogramas ARASAAC organizados por categorías para comunicación rápida y efectiva.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>10,000+ pictogramas</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Búsqueda por categorías</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Personalización completa</span>
                </li>
              </ul>
            </div>
            
            {/* Característica 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Volume2 className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Síntesis de Voz Natural</h3>
              <p className="text-gray-600 mb-4">
                Convierte texto en voz natural con múltiples opciones de voces, velocidades y tonos.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Voces masculinas/femeninas</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Control de velocidad y tono</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Integración con Azure TTS</span>
                </li>
              </ul>
            </div>
            
            {/* Característica 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 transition-colors">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Panel Educativo</h3>
              <p className="text-gray-600 mb-4">
                Contenido educativo estructurado para el desarrollo del lenguaje y habilidades comunicativas.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Lecciones interactivas</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Actividades por niveles</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Seguimiento de progreso</span>
                </li>
              </ul>
            </div>
            
            {/* Característica 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Gamepad2 className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Juegos Educativos</h3>
              <p className="text-gray-600 mb-4">
                Juegos diseñados para reforzar la comunicación, memoria y habilidades cognitivas de forma divertida.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span>Juegos de memoria</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span>Asociación de pictogramas</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span>Adaptación por dificultad</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo <span className="text-blue-600">Funciona</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tres simples pasos para empezar a comunicarte de manera efectiva
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Regístrate Gratis</h3>
              <p className="text-gray-600">
                Crea una cuenta en minutos. Sin compromisos, sin tarjetas de crédito.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personaliza tu Comunicador</h3>
              <p className="text-gray-600">
                Añade pictogramas favoritos, ajusta voces y organiza categorías según tus necesidades.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunica y Aprende</h3>
              <p className="text-gray-600">
                Usa el comunicador diariamente, accede a juegos educativos y sigue tu progreso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Empieza a Comunicarte Hoy
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a miles de usuarios que ya están utilizando ComunicaCentros para mejorar su comunicación y desarrollo del lenguaje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              to="/comunicador"
              className="bg-transparent hover:bg-blue-800 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Probar Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">ComunicaCentros</h3>
                  <p className="text-sm text-gray-400">Comunicación Aumentativa</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma profesional de Comunicación Aumentativa y Alternativa diseñada para empoderar a personas con dificultades del habla.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/comunicador" className="text-gray-400 hover:text-white transition-colors">
                    Comunicador
                  </Link>
                </li>
                <li>
                  <Link to="/panel-educativo" className="text-gray-400 hover:text-white transition-colors">
                    Panel Educativo
                  </Link>
                </li>
                <li>
                  <Link to="/juegos" className="text-gray-400 hover:text-white transition-colors">
                    Juegos
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">
                    Acceso Centro
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Tutoriales
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Soporte
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  <span>info@comunicacentros.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users size={16} />
                  <span>+34 123 456 789</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} ComunicaCentros. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
