import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { getProfiles } from '../services/profileService';

export default function PatientProfileSelector({ onSelectProfile, currentProfileId }) {
  const [profiles, setProfiles] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

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

  const currentProfile = profiles.find(p => p.id === currentProfileId);

  return (
    <div className="relative">
      {/* Botón de perfil actual */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-300 px-4 py-2 rounded-lg transition-colors"
      >
        {currentProfile ? (
          <>
            {currentProfile.photo_url ? (
              <img 
                src={currentProfile.photo_url} 
                alt={currentProfile.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
            )}
            <span className="font-medium text-gray-700">{currentProfile.name}</span>
          </>
        ) : (
          <>
            <User size={20} className="text-gray-600" />
            <span className="text-gray-600">Seleccionar Paciente</span>
          </>
        )}
      </button>

      {/* Dropdown de selector */}
      {showSelector && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowSelector(false)}
          />
          
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 w-80 z-50">
            <h3 className="font-bold text-gray-800 mb-3">Seleccionar Paciente</h3>

            {/* Lista de perfiles */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {profiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => {
                    onSelectProfile(profile.id);
                    setShowSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    currentProfileId === profile.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  {profile.photo_url ? (
                    <img 
                      src={profile.photo_url} 
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">{profile.name}</p>
                    <p className="text-xs text-gray-500">
                      {profile.stats?.total_button_clicks || 0} clics • {profile.stats?.total_phrases || 0} frases
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
