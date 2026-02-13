import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthChange, isUserAdmin, getUserRole } from './services/authService';
import { useApp } from './contexts/AppContext';
import LandingPage from './pages/LandingPage';
import PatientView from './pages/PatientView';
import AdminView from './pages/AdminView';
import SearchPage from './pages/SearchPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingPage from './pages/OnboardingPage';
import EducationalDashboard from './pages/EducationalDashboard';
import EducationalGames from './pages/EducationalGames';
import ProgressPage from './pages/ProgressPage';
import EducationalForum from './components/EducationalForum';
import MemoryGame from './components/games/MemoryGame';
import SentencePuzzleGame from './components/games/SentencePuzzleGame';
import CommunicationQuizGame from './components/games/CommunicationQuizGame';
import WordFormationGame from './components/games/WordFormationGame';
import ResponsiveTest from './components/ResponsiveTest';

// Componente para verificar permisos de administrador
// ⚠️ CRÍTICO: Verificación SOLO desde Firestore, nunca desde datos locales
function AdminRoute({ user, onLogout }) {
  const [adminStatus, setAdminStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // ✅ ÚNICA verificación confiable: desde Firestore
        const isAdmin = await isUserAdmin();
        setAdminStatus(isAdmin);
      } catch (error) {
        console.error('Error verificando rol de administrador:', error);
        setAdminStatus(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  return adminStatus ? (
    <AdminView onLogout={onLogout} user={user} />
  ) : (
    <Navigate to="/" />
  );
}

// Componente para rutas protegidas por rol
function RoleProtectedRoute({ user, allowedRoles, children, fallbackPath = '/' }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userRole = await getUserRole();
        setRole(userRole);
      } catch (error) {
        console.error('Error verificando rol:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario o el rol no está permitido, redirigir
  if (!user || !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} />;
  }

  return children;
}

// Componente para la página de perfil
function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');
  const [profileImage, setProfileImage] = useState(() => {
    // Cargar imagen desde localStorage al inicializar
    const savedImage = localStorage.getItem(`profileImage_${user.uid}`);
    return savedImage || null;
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleAction = (action) => {
    switch (action) {
      case 'edit':
        setNotification('Función de editar perfil en desarrollo');
        break;
      case 'password':
        setNotification('Función de cambiar contraseña en desarrollo');
        break;
      case 'progress':
        navigate('/progreso');
        break;
      case 'settings':
        navigate('/configuracion');
        break;
      case 'back':
        navigate(-1); // Volver a la página anterior
        break;
      default:
        setNotification('Acción no implementada');
    }
    
    // Limpiar notificación después de 3 segundos
    if (action !== 'progress' && action !== 'settings' && action !== 'back') {
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setNotification('Por favor, selecciona un archivo de imagen válido (JPG, PNG, GIF)');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification('La imagen es demasiado grande. Máximo 5MB');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      setProfileImage(imageDataUrl);
      
      // Guardar en localStorage
      localStorage.setItem(`profileImage_${user.uid}`, imageDataUrl);
      
      setNotification('¡Foto de perfil actualizada correctamente!');
      setIsUploading(false);
      setTimeout(() => setNotification(''), 3000);
    };
    
    reader.onerror = () => {
      setNotification('Error al cargar la imagen. Inténtalo de nuevo.');
      setIsUploading(false);
      setTimeout(() => setNotification(''), 3000);
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (profileImage) {
      setProfileImage(null);
      localStorage.removeItem(`profileImage_${user.uid}`);
      setNotification('Foto de perfil eliminada');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con botón volver */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleAction('back')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <div className="w-20"></div> {/* Espaciador para alinear */}
        </div>

        {/* Notificación */}
        {notification && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg animate-fadeIn">
            {notification}
          </div>
        )}

        {/* Tarjeta de información del usuario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {/* Avatar/Foto de perfil */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Overlay para acciones */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors flex items-center gap-2">
                      {isUploading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                          </svg>
                          Cambiar foto
                        </>
                      )}
                    </div>
                  </label>
                  
                  {profileImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="bg-white text-red-600 px-4 py-2 rounded-full font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName || 'Usuario'}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Conectado</span>
              </div>
              
              {/* Información de la foto */}
              <div className="mt-4 text-sm text-gray-500">
                {profileImage ? (
                  <p>✅ Tienes una foto de perfil personalizada</p>
                ) : (
                  <p>📷 Sube una foto para personalizar tu perfil</p>
                )}
                <p className="text-xs mt-1">Máximo 5MB • Formatos: JPG, PNG, GIF</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Información de la cuenta</h3>
              <p className="text-sm text-gray-700 mb-1"><span className="font-medium">ID:</span> {user.uid.substring(0, 12)}...</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Email verificado:</span> {user.emailVerified ? '✅ Sí' : '❌ No'}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">Estadísticas</h3>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Miembro desde:</span> {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Último acceso:</span> {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleAction('edit')}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all hover:scale-105"
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <span className="font-medium">Editar perfil</span>
            </button>
            
            <button
              onClick={() => handleAction('password')}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all hover:scale-105"
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
              <span className="font-medium">Cambiar contraseña</span>
            </button>
            
            <button
              onClick={() => handleAction('progress')}
              className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all hover:scale-105"
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span className="font-medium">Ver progreso</span>
            </button>
            
            <button
              onClick={() => handleAction('settings')}
              className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all hover:scale-105"
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span className="font-medium">Configuración</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializar dark mode al cargar la app
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const shouldBeDark = saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const html = document.documentElement;
    if (shouldBeDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  // Escuchar cambios de dark mode
  useEffect(() => {
    const handleDarkModeChange = (e) => {
      const isDark = e.detail;
      const html = document.documentElement;
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      // Forzar rerender
      setUser(prev => prev);
    };

    // Escuchar cambios de idioma
    const handleLanguageChange = (e) => {
      console.log('Idioma cambiado a:', e.detail);
      // Forzar rerender de toda la app
      setUser(prev => prev);
    };

    window.addEventListener('darkModeChanged', handleDarkModeChange);
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('darkModeChanged', handleDarkModeChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      // Reducir delay a 1 segundo para mejor UX
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    });

    // Si no hay usuario después de 1.5 segundos, dejar de cargar
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          {/* Logo animado */}
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 mx-auto relative">
              {/* Círculo exterior */}
              <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
              {/* Círculo animado principal */}
              <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              {/* Círculo interior */}
              <div className="absolute inset-4 border-4 border-accent-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              {/* Icono central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Texto principal */}
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Comunica<span className="text-primary-600">Centros</span>
          </h1>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            Cargando tu experiencia personalizada de comunicación aumentativa...
          </p>
          
          {/* Barra de progreso */}
          <div className="w-64 h-2 bg-neutral-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse" style={{ width: '70%' }}></div>
          </div>
          
          {/* Texto de carga */}
          <p className="text-sm text-neutral-500 mt-6">
            Preparando herramientas de comunicación para ti
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

// Componente separado que usa renderKey del contexto
function AppRoutes({ user, setUser }) {
  const { renderKey } = useApp();

  return (
    <div key={renderKey}>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        
        {/* Registro */}
        <Route
          path="/registro"
          element={<Register />}
        />
        
        {/* Onboarding - Para usuarios nuevos sin organización */}
        <Route
          path="/onboarding"
          element={
            user ? (
              <OnboardingPage />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<Login onLogin={() => {}} />}
        />

        {/* Admin Panel - Protected Route (Solo para administradores) */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute
              user={user}
              allowedRoles={['admin']}
              fallbackPath="/"
            >
              <AdminView onLogout={() => setUser(null)} user={user} />
            </RoleProtectedRoute>
          }
        />
        
        {/* Patient View - Communicator */}
        <Route path="/comunicador" element={<PatientView />} />

        {/* Search Page - Protected */}
        <Route
          path="/search"
          element={
            user ? (
              <SearchPage />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* Rutas Educativas - Protegidas por autenticación */}
        <Route
          path="/panel-educativo"
          element={
            user ? (
              <EducationalDashboard user={user} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/juegos"
          element={
            user ? (
              <EducationalGames user={user} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/juegos/memoria"
          element={
            user ? (
              <MemoryGame />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/juegos/rompecabezas-frases"
          element={
            user ? (
              <SentencePuzzleGame />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/juegos/quiz-comunicacion"
          element={
            user ? (
              <CommunicationQuizGame />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/juegos/formacion-palabras"
          element={
            user ? (
              <WordFormationGame />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/progreso"
          element={
            user ? (
              <ProgressPage user={user} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        {/* Foro Educativo */}
        <Route
          path="/foro"
          element={
            user ? (
              <EducationalForum user={user} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* Perfil de usuario */}
        <Route
          path="/perfil"
          element={
            user ? (
              <ProfilePage user={user} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        {/* Rutas adicionales (placeholder) */}
        <Route
          path="/perfil-educativo"
          element={
            user ? (
              <div className="p-8">Perfil Educativo (en construcción)</div>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/configuracion"
          element={
            user ? (
              <div className="p-8">Configuración (en construcción)</div>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        <Route
          path="/consejos"
          element={
            user ? (
              <div className="p-8">Consejos (en construcción)</div>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Componente de prueba de responsividad - DESACTIVADO TEMPORALMENTE */}
      {/* {import.meta.env.DEV && <ResponsiveTest />} */}
    </div>
  );
}

export default App;
