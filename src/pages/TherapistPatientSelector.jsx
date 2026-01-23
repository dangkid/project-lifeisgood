import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfiles } from '../services/profileService';
import { User, LogOut, Search } from 'lucide-react';

export default function TherapistPatientSelector() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [therapistSession, setTherapistSession] = useState(null);

  useEffect(() => {
    // Verificar sesión de especialista
    const session = localStorage.getItem('therapistSession');
    if (!session) {
      navigate('/especialista/login');
      return;
    }
    setTherapistSession(JSON.parse(session));
    loadProfiles();
  }, [navigate]);

  const loadProfiles = async () => {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (profileId) => {
    // Guardar el paciente seleccionado en la sesión
    localStorage.setItem('selectedPatientId', profileId);
    navigate('/comunicador');
  };

  const handleLogout = () => {
    localStorage.removeItem('therapistSession');
    localStorage.removeItem('selectedPatientId');
    navigate('/');
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Cargando perfiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Seleccionar Paciente</h1>
              {therapistSession && (
                <p className="text-sm text-gray-600">
                  Especialista: <span className="font-semibold">{therapistSession.username}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar paciente por nombre o etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
            </p>
            {!searchTerm && (
              <p className="text-gray-500 text-sm mt-2">
                Contacta al administrador para crear perfiles de pacientes
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => handleSelectPatient(profile.id)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-green-500 p-6 transition-all transform hover:scale-105 text-left"
              >
                <div className="flex items-center gap-4 mb-3">
                  {profile.photo_url ? (
                    <img 
                      src={profile.photo_url} 
                      alt={profile.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200">
                      <User size={32} className="text-green-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
                    <p className="text-sm text-gray-500">{profile.age} años</p>
                  </div>
                </div>

                {profile.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {profile.description}
                  </p>
                )}

                {profile.tags && profile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {profile.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{profile.tags.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
