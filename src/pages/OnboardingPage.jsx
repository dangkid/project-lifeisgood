/**
 * OnboardingPage - Experiencia de bienvenida post-login
 * Usuario elige: Crear nuevo centro O Unirse a centro existente
 * Diseño profesional y responsive
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import OrganizationSetup from '../components/OrganizationSetup';
import Navbar from '../components/Navbar';
import { LogOut, ArrowLeft, MessageCircle } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación
  useState(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleOrgComplete = async () => {
    // Esperar un momento para que Firestore se actualice
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Redirigir a la app principal
    navigate('/comunicador');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar profesional */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">ComunicaCentros</span>
              <span className="text-xs text-gray-500">Comunicación Aumentativa</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">
                  Hola, <strong>{user.displayName || user.email.split('@')[0]}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        <OrganizationSetup onComplete={handleOrgComplete} />
      </div>

      {/* Footer helper text */}
      <div className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 max-w-xs">
        <p className="text-sm text-gray-600 bg-white bg-opacity-90 p-4 rounded-lg shadow-sm">
          💡 <strong>Tip:</strong> Si ya tienes un código de invitación, selecciona "Unirse a Centro" y pégalo aquí.
        </p>
      </div>
    </div>
  );
}
