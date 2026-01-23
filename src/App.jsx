import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange } from './services/authService';
import PatientView from './pages/PatientView';
import AdminView from './pages/AdminView';
import Login from './pages/Login';

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
        {/* Patient View - Public Route */}
        <Route path="/" element={<PatientView />} />

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
              <AdminView onLogout={() => setUser(null)} />
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
