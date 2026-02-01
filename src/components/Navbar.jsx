/**
 * Navbar - Barra de navegación principal
 * Incluye logo, menú y notificaciones
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Search, Bell, Settings } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function Navbar({ user, isTherapist = false, onLogout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* Logo/Inicio */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span className="text-2xl">🎯</span>
            <span className="hidden sm:inline">LifeIsGood</span>
          </Link>

          {/* Navegación Central - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
              title="Búsqueda avanzada"
            >
              <Search size={20} />
              <span>Buscar</span>
            </Link>

            {isTherapist && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
                title="Panel de administración"
              >
                <Settings size={20} />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Derecha: Notificaciones + Usuario */}
          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <div className="relative">
              <NotificationCenter />
            </div>

            {/* Usuario + Menú */}
            <div className="flex items-center gap-3 border-l pl-4">
              {user?.displayName && (
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-gray-800">{user.displayName}</p>
                  {isTherapist && (
                    <p className="text-xs text-blue-600">👨‍⚕️ Terapeuta</p>
                  )}
                </div>
              )}

              {/* Menú Móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Menú"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
          <div className="md:hidden border-t mt-3 pt-3 space-y-2">
            <Link
              to="/search"
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search size={20} />
              <span>Buscar</span>
            </Link>

            {isTherapist && (
              <Link
                to="/admin"
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
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
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
