import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getButtons } from '../services/buttonService';
import { recordButtonClick, recordPhraseCreated, getProfiles } from '../services/profileService';
import CommunicationButton from '../components/patient/CommunicationButton';
import StoryButton from '../components/patient/StoryButton';
import PhraseBuilder from '../components/patient/PhraseBuilder';
import PatientProfileSelector from '../components/PatientProfileSelector';
import ProfileStats from '../components/ProfileStats';
import Tutorial from '../components/Tutorial';
import { LogIn, BarChart3, User, Users, MessageCircle, ChevronDown, Settings, UserCircle2, Home, Zap } from 'lucide-react';

export default function PatientView() {
  const navigate = useNavigate();
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [currentProfileId, setCurrentProfileId] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [isTherapistMode, setIsTherapistMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    checkTherapistSession();
    
    // Verificar sesión cada vez que la página recibe focus
    const handleFocus = () => {
      checkTherapistSession();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    loadButtons();
  }, [currentProfileId]); // Recargar cuando cambie el perfil

  // Verificar sesión periódicamente (cada 2 segundos cuando está activo)
  useEffect(() => {
    const interval = setInterval(() => {
      const therapistSession = localStorage.getItem('therapistSession');
      const isCurrentlyTherapist = !!therapistSession;
      
      // Solo actualizar si el estado cambió
      if (isCurrentlyTherapist !== isTherapistMode) {
        checkTherapistSession();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isTherapistMode]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkTherapistSession = async () => {
    // Verificar si hay un especialista logueado
    const therapistSession = localStorage.getItem('therapistSession');
    const selectedPatientId = localStorage.getItem('selectedPatientId');
    
    // Si hay sesión de especialista, activar modo especialista
    if (therapistSession) {
      setIsTherapistMode(true);
      
      // Si además hay un paciente seleccionado, cargar sus datos
      if (selectedPatientId) {
        setCurrentProfileId(selectedPatientId);
        try {
          const profiles = await getProfiles();
          const profile = profiles.find(p => p.id === selectedPatientId);
          setCurrentProfile(profile);
        } catch (error) {
          console.error('Error loading patient profile:', error);
        }
      }
    } else {
      // Si no hay sesión, asegurarse de limpiar todo
      setIsTherapistMode(false);
      setCurrentProfileId(null);
      setCurrentProfile(null);
    }
  };

  const handleLogoutTherapist = () => {
    localStorage.removeItem('therapistSession');
    localStorage.removeItem('selectedPatientId');
    setIsTherapistMode(false);
    setCurrentProfileId(null);
    setCurrentProfile(null);
    navigate('/');
  };

  const loadButtons = async () => {
    try {
      setLoading(true);
      // Filtrar botones por perfil actual
      const allButtons = await getButtons(currentProfileId);
      setButtons(allButtons);
    } catch (error) {
      console.error('Error loading buttons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonSelect = async (button) => {
    // Modo Directo: Reproducir voz inmediatamente
    if (directMode) {
      const speech = new SpeechSynthesisUtterance(button.text || button.label);
      speech.lang = 'es-ES';
      if (button.gender === 'female') {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('female'));
        if (femaleVoice) speech.voice = femaleVoice;
      }
      window.speechSynthesis.speak(speech);
      
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Registrar en estadísticas
      if (currentProfileId) {
        try {
          await recordButtonClick(currentProfileId, button.id, button.text);
        } catch (error) {
          console.error('Error recording button click:', error);
        }
      }
      return;
    }
    
    // Modo Constructor: Agregar a la frase
    setSelectedButtons([...selectedButtons, button]);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Registrar en estadísticas
    if (currentProfileId) {
      try {
        await recordButtonClick(currentProfileId, button.id, button.text);
      } catch (error) {
        console.error('Error recording button click:', error);
      }
    }
  };

  const handleRemoveButton = (index) => {
    setSelectedButtons(selectedButtons.filter((_, i) => i !== index));
  };

  const handleClearPhrase = () => {
    setSelectedButtons([]);
  };

  const communicationButtons = buttons.filter(b => b.type === 'communication');
  const storyButtons = buttons.filter(b => b.type === 'story');

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      {/* Header Simple - Responsive */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <span className="hidden sm:inline">AAC Comunicador</span>
              <span className="sm:hidden">AAC</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-3 relative">
            {/* Toggle Modo Directo / Constructor - Responsive */}
            <button
              onClick={() => setDirectMode(!directMode)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all font-medium text-sm sm:text-base ${
                directMode 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white active:bg-orange-700' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white active:bg-blue-700'
              }`}
              title={directMode ? 'Modo Directo: Habla al tocar' : 'Modo Constructor: Crea frases'}
            >
              {directMode ? (
                <>
                  <Zap size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Directo</span>
                </>
              ) : (
                <>
                  <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Constructor</span>
                </>
              )}
            </button>
            
            {/* Modo Especialista: Mostrar info del paciente o selector - Responsive */}
            {isTherapistMode && (
              currentProfile ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 bg-green-50 border-2 border-green-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                    {currentProfile.photo_url ? (
                      <img 
                        src={currentProfile.photo_url} 
                        alt={currentProfile.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={16} className="sm:w-5 sm:h-5 text-green-600" />
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <p className="text-xs text-green-600 font-medium">Paciente</p>
                      <p className="font-bold text-gray-700 text-sm">{currentProfile.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentProfile(null);
                      setCurrentProfileId(null);
                      localStorage.removeItem('selectedPatientId');
                    }}
                    className="bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors"
                    title="Cambiar paciente"
                  >
                    <span className="hidden sm:inline">Cambiar</span>
                    <span className="sm:hidden">✕</span>
                  </button>
                </div>
              ) : (
                /* Selector de paciente (solo visible para especialista sin paciente seleccionado) */
                <PatientProfileSelector 
                  onSelectProfile={setCurrentProfileId}
                  currentProfileId={currentProfileId}
                />
              )
            )}
            
            {/* Botón de Estadísticas - Responsive */}
            {currentProfileId && (
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                title="Ver Estadísticas"
              >
                <BarChart3 size={20} />
                <span className="hidden md:inline">Stats</span>
              </button>
            )}
            
            {/* Menú de Usuario (solo visible cuando está logueado) */}
            {isTherapistMode ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <UserCircle2 size={20} />
                  <span className="hidden md:inline font-medium">Especialista</span>
                  <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <p className="text-xs text-blue-600 font-medium mb-1">Sesión de Especialista</p>
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {localStorage.getItem('therapistSession')}
                      </p>
                      {currentProfile && (
                        <p className="text-xs text-gray-600 mt-1">
                          Paciente: <span className="font-medium">{currentProfile.name}</span>
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/especialista');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <Home size={18} />
                      <span>Panel de Especialista</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Aquí podrías abrir un modal de configuración
                        alert('Configuración próximamente');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <Settings size={18} />
                      <span>Configuración</span>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          handleLogoutTherapist();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors font-medium"
                      >
                        <LogIn size={18} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Botón Iniciar Sesión (solo visible cuando no está logueado) */
              <button
                onClick={() => navigate('/especialista/login')}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogIn size={20} />
                Iniciar Sesión
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido - Responsive */}
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Botones de Comunicación */}
        {communicationButtons.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Comunicación
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {communicationButtons.map(button => (
                <CommunicationButton 
                  key={button.id} 
                  button={button}
                  onClick={handleButtonSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Botones de Cuentos */}
        {storyButtons.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Cuentos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {storyButtons.map(button => (
                <StoryButton key={button.id} button={button} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {buttons.length === 0 && (
          <div className="text-center text-gray-600 text-2xl mt-20">
            No hay botones disponibles
          </div>
        )}
      </div>

      {/* Constructor de Frases (solo en modo constructor) */}
      {!directMode && (
        <PhraseBuilder 
          selectedButtons={selectedButtons}
          onRemoveButton={handleRemoveButton}
          onClear={handleClearPhrase}
          voiceGender="female"
          profileId={currentProfileId}
        />
      )}
      

      {/* Modal de Estadísticas */}
      {showStats && currentProfileId && (
        <ProfileStats 
          profileId={currentProfileId}
          onClose={() => setShowStats(false)}
        />
      )}
      
      {/* Tutorial */}
      <Tutorial type="patient" />
    </div>
  );
}
