/**
 * Navbar - Barra de navegación principal
 * Incluye logo, menú y notificaciones
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Search, Bell, Settings, MessageCircle, BookOpen, Gamepad2 } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';
import ConnectionStatus from './ConnectionStatus';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useApp } from '../contexts/AppContext';
import { useLanguageChange } from '../hooks/useLanguageChange';

export default function Navbar({ user, isTherapist = false, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, renderKey } = useApp();
  useLanguageChange(); // Hook para forzar re-render cuando cambia idioma
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  // Detectar si estamos en el comunicador
  const isInCommunicator = location.pathname === '/comunicador';
  const isInAdmin = location.pathname === '/admin';

  // Forzar re-render cuando cambie el idioma
  useEffect(() => {
    forceUpdate(prev => prev + 1);
  }, [language]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) {
        onLogout();
      }
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* Logo/Inicio */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">ComunicaCentros</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Comunicación Aumentativa</span>
            </div>
          </Link>

          {/* Navegación Central - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/search"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
              title={t('navbar.search')}
            >
              <Search size={20} />
              <span className="hidden lg:inline">{t('navbar.search')}</span>
            </Link>

            {/* Solo mostrar ComunicaEducación y ComunicaJuegos si no estamos en el comunicador ni en admin */}
            {!isInCommunicator && !isInAdmin && (
              <>
                <Link
                  to="/panel-educativo"
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                  title="ComunicaEducación"
                >
                  <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold leading-none">ComunicaEducación</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">Aprende jugando</span>
                  </div>
                </Link>

                <Link
                  to="/juegos"
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                  title="ComunicaJuegos"
                >
                  <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center">
                    <Gamepad2 className="w-3 h-3 text-white" />
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold leading-none">ComunicaJuegos</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">Aprende jugando</span>
                  </div>
                </Link>
              </>
            )}

            {isTherapist && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                title={t('navbar.admin')}
              >
                <Settings size={20} />
                <span className="hidden lg:inline">{t('navbar.admin')}</span>
              </Link>
            )}
          </div>

          {/* Derecha: Notificaciones + Usuario */}
          <div className="flex items-center gap-3">
            {/* Conexión */}
            <ConnectionStatus />
            
            {/* Dark Mode */}
            <DarkModeToggle />
            
            {/* Notificaciones */}
            <div className="relative">
              <NotificationCenter />
            </div>
            
            {/* Idioma - Posicionado correctamente */}
            <div className="relative">
              <LanguageSwitcher />
            </div>

            {/* Usuario + Menú */}
            <div className="flex items-center gap-3 border-l dark:border-gray-700 pl-3">
              {user?.displayName && (
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user.displayName}</p>
                  {isTherapist && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">👨‍⚕️ Terapeuta</p>
                  )}
                </div>
              )}

              {/* Menú Móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Menú"
              >
                {isMenuOpen ? <X size={24} className="text-gray-700 dark:text-gray-300" /> : <Menu size={24} className="text-gray-700 dark:text-gray-300" />}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        {isMenuOpen && (
          <div className="md:hidden border-t dark:border-gray-700 mt-3 pt-3 space-y-2">
            <Link
              to="/search"
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search size={20} />
              <span>Buscar</span>
            </Link>

            <Link
              to="/panel-educativo"
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span>ComunicaEducación</span>
            </Link>

            <Link
              to="/juegos"
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center">
                <Gamepad2 className="w-3 h-3 text-white" />
              </div>
              <span>ComunicaJuegos</span>
            </Link>

            {isTherapist && (
              <Link
                to="/admin"
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings size={20} />
                <span>Panel Admin</span>
              </Link>
            )}

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
