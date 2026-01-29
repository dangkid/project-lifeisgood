import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange } from './services/authService';
import LandingPage from './pages/LandingPage';
import PatientView from './pages/PatientView';
import AdminView from './pages/AdminView';
import Login from './pages/Login';
import Register from './pages/Register';
import EducationalDashboard from './pages/EducationalDashboard';
import EducationalGames from './pages/EducationalGames';
import ProgressPage from './pages/ProgressPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      // Agregar delay mínimo de 2 segundos para mostrar la animación
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center relative">
        <div className="flex flex-col items-center gap-6">
          {/* Círculos animados */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-4 border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          {/* Texto principal */}
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AAC Comunicador
          </div>
        </div>
        {/* Footer - Texto secundario */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-gray-600 text-sm font-medium">
          Hecho con mucho ❤️
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Home */}
        <Route path="/" element={<LandingPage user={user} />} />
        
        {/* Registro */}
        <Route
          path="/registro"
          element={<Register />}
        />
        
        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<Login onLogin={() => {}} />}
        />

        {/* Admin Panel - Protected Route */}
        <Route
          path="/admin"
          element={
            user ? (
              <AdminView onLogout={() => setUser(null)} user={user} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        
        {/* Patient View - Communicator */}
        <Route path="/comunicador" element={<PatientView />} />

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
          path="/progreso"
          element={
            user ? (
              <ProgressPage user={user} />
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
    </BrowserRouter>
  );
}

export default App;
