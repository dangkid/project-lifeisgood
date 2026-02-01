/**
 * Página de Búsqueda Avanzada
 * Interfaz completa para buscar botones, perfiles y recursos
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdvancedSearch from '../components/AdvancedSearch';
import { db, auth } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SearchPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [isTherapist, setIsTherapist] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación y obtener organización
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);

      try {
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const orgId = userData.organizationId;
          
          if (orgId) {
            setOrganizationId(orgId);
            
            // Verificar si es terapeuta
            const memberDoc = await getDoc(
              doc(db, `organizations/${orgId}/members/${currentUser.uid}`)
            );
            
            if (memberDoc.exists()) {
              const memberData = memberDoc.data();
              setIsTherapist(memberData.role === 'admin' || memberData.role === 'especialista');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} isTherapist={isTherapist} onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} isTherapist={isTherapist} onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              No tienes una organización asignada
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar user={user} isTherapist={isTherapist} onLogout={handleLogout} />

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 Búsqueda Avanzada
          </h1>
          <p className="text-gray-600">
            Encuentra botones, perfiles y recursos en tu organización
          </p>
        </div>

        {/* Componente de Búsqueda */}
        <AdvancedSearch organizationId={organizationId} />
      </div>
    </div>
  );
}
