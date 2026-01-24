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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Círculos animados */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-4 border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          {/* Texto */}
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AAC Comunicador
          </div>
        </div>
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
