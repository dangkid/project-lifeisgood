import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange } from './services/authService';
import LandingPage from './pages/LandingPage';
import PatientView from './pages/PatientView';
import AdminView from './pages/AdminView';
import Login from './pages/Login';
import TherapistLogin from './pages/TherapistLogin';
import TherapistPatientSelector from './pages/TherapistPatientSelector';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-6xl font-bold">Cargando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Home */}
        <Route path="/" element={<LandingPage user={user} />} />
        
        {/* Therapist Login */}
        <Route 
          path="/especialista/login" 
          element={
            user ? <Navigate to="/especialista" /> : <TherapistLogin />
          } 
        />
        
        {/* Therapist Panel - Protected Route (same as admin) */}
        <Route 
          path="/especialista" 
          element={
            user ? <AdminView isTherapist={true} user={user} onLogout={() => setUser(null)} /> : <Navigate to="/especialista/login" />
          } 
        />
        
        {/* Patient View - Communicator */}
        <Route path="/comunicador" element={<PatientView />} />

        {/* Admin Login */}
        <Route 
          path="/admin/login" 
          element={
            user ? <Navigate to="/admin" /> : <Login onLogin={() => {}} />
          } 
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

        {/* Catch all - redirect to patient view */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
