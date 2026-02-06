import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getButtons } from '../services/buttonService';
import { recordButtonClick, recordPhraseCreated, getProfiles } from '../services/profileService';
import { enhancedTtsService } from '../services/enhancedTtsService';
import { useLanguageChange } from '../hooks/useLanguageChange';
import CommunicationButton from '../components/patient/CommunicationButton';
import StoryButton from '../components/patient/StoryButton';
import PhraseBuilder from '../components/patient/PhraseBuilder';
import QuickAccessPanel from '../components/patient/QuickAccessPanel';
import CategoryFilter from '../components/patient/CategoryFilter';
import RecentPhrases, { addToRecentPhrases } from '../components/patient/RecentPhrases';
import PatientProfileSelector from '../components/PatientProfileSelector';
import ProfileStats from '../components/ProfileStats';
import AccessibilitySettings from '../components/AccessibilitySettings';
import Tutorial from '../components/Tutorial';
import Navbar from '../components/Navbar';
import EnhancedCommunicator from '../components/patient/EnhancedCommunicator';
import { LogIn, BarChart3, User, Users, MessageCircle, ChevronDown, Settings, UserCircle2, Home, Zap, Circle, Search, X, Sparkles } from 'lucide-react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { filterButtonsByContext } from '../utils/timeContext';
import { useApp } from '../contexts/AppContext';

export default function PatientView() {
  const navigate = useNavigate();
  const { t, language, isDark, renderKey } = useApp();
  useLanguageChange(); // Hook para forzar re-render cuando cambia idioma
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [currentProfileId, setCurrentProfileId] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [isTherapistMode, setIsTherapistMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [, forceUpdate] = useState(0);
  const [useEnhancedCommunicator, setUseEnhancedCommunicator] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    scanningEnabled: false,
    scanSpeed: 1500,
    groupScanning: false,
    buttonSize: 'xlarge',
    predictionEnabled: true,
    strongFeedback: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  // Forzar re-render cuando cambie el idioma
  useEffect(() => {
    forceUpdate(prev => prev + 1);
  }, [language]);

  useEffect(() => {
    checkTherapistSession();
    
    // Verificar sesión cada vez que la página recibe focus
    const handleFocus = () => {
      checkTherapistSession();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Escuchar cambios de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
    };
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
      try {
        // Usar el nuevo servicio TTS mejorado
        await enhancedTtsService.speak(button.text || button.label, {
          voiceGender: 'female', // O podríamos usar button.gender si está disponible
          userId: firebaseUser?.uid || currentProfileId || 'default'
        });
        
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        
        // Agregar a frases recientes
        addToRecentPhrases(button.text);
        
        // Registrar en estadísticas
        if (currentProfileId) {
          try {
            await recordButtonClick(currentProfileId, button.id, button.text);
          } catch (error) {
            console.error('Error recording button click:', error);
          }
        }
      } catch (error) {
        console.error('Error al reproducir voz:', error);
        // Fallback al método anterior si hay error
        const speech = new SpeechSynthesisUtterance(button.text || button.label);
        speech.lang = 'es-ES';
        window.speechSynthesis.speak(speech);
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

  // Filtrar botones por categoría
  const getFilteredButtons = (buttons) => {
    if (activeCategory === 'all') return buttons;
    return buttons.filter(b => b.context === activeCategory);
  };

  // Filtrar botones por contexto de tiempo (mañana, tarde, noche)
  const timeFilteredButtons = filterButtonsByContext(buttons);

  const communicationButtons = getFilteredButtons(timeFilteredButtons.filter(b => b.type === 'communication'));
  const storyButtons = getFilteredButtons(timeFilteredButtons.filter(b => b.type === 'story'));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-32 transition-colors">
      {/* Navbar con elementos importantes */}
      <Navbar 
        user={firebaseUser} 
        isTherapist={isTherapistMode}
        onLogout={handleLogoutTherapist}
      />

      {/* Toggle para Enhanced Communicator */}
      {currentProfileId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
          <button
            onClick={() => setUseEnhancedCommunicator(!useEnhancedCommunicator)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {useEnhancedCommunicator ? 'Ver Vista Tradicional' : 'Probar Comunicador Mejorado'}
          </button>
        </div>
      )}

      {/* Enhanced Communicator View */}
      {useEnhancedCommunicator && currentProfileId ? (
        <div className="h-[calc(100vh-150px)] p-4">
          <EnhancedCommunicator
            userId={firebaseUser?.uid || currentProfileId}
            profileId={currentProfileId}
            userName={currentProfile?.name || 'Usuario'}
            stats={{}}
            communications={[]}
            onCommunicate={(data) => {
              console.log('Comunicación enviada:', data);
            }}
            isOpen={true}
          />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-16 z-40 transition-colors">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Logo Comunicador - Compacto */}
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="font-bold text-gray-800 dark:text-gray-100">{t('patient.communicator')}</span>
            </div>
            
            {/* Barra de búsqueda mejorada */}
            <div className="hidden sm:block flex-grow max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar palabras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 pl-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Toggle Modo Directo / Constructor */}
            <button
              onClick={() => setDirectMode(!directMode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all font-medium text-sm ${
                directMode 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={directMode ? t('patient.directModeDesc') : t('patient.builderModeDesc')}
            >
              {directMode ? (
                <><Zap size={16} /></>
              ) : (
                <><MessageCircle size={16} /></>
              )}
              <span className="hidden sm:inline text-xs">{directMode ? 'Directo' : 'Constructor'}</span>
            </button>
            
            {/* Modo Especialista: Mostrar info del paciente - Compacto */}
            {isTherapistMode && currentProfile && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 px-2 py-1 rounded-lg">
                  {currentProfile.photo_url ? (
                    <img 
                      src={currentProfile.photo_url} 
                      alt={currentProfile.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-green-600" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-green-700 dark:text-green-300 hidden sm:inline">{currentProfile.name}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentProfile(null);
                    setCurrentProfileId(null);
                    localStorage.removeItem('selectedPatientId');
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* Botón Accesibilidad - Compacto */}
            <button
              onClick={() => setShowAccessibilitySettings(true)}
              className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              title={t('patient.accessibility')}
            >
              <Settings size={16} />
              <span className="hidden md:inline text-xs">A11y</span>
            </button>

            {/* Botón Estadísticas - Compacto */}
            {currentProfileId && (
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                title={t('patient.viewStats')}
              >
                <BarChart3 size={16} />
                <span className="hidden md:inline text-xs">Stats</span>
              </button>
            )}
            
            {/* Menú Usuario - Compacto */}
            {isTherapistMode ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg transition-all"
                >
                  <UserCircle2 size={16} />
                  <span className="hidden md:inline text-xs font-medium">Espec.</span>
                  <ChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
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
            ) : firebaseUser ? (
              /* Mostrar información del usuario de Firebase cuando está autenticado */
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  {firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario'}
                </span>
              </div>
            ) : (
              /* Botón Iniciar Sesión (solo visible cuando no está logueado) */
              <button
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogIn size={20} />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido - Optimizado para tablets */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Panel de Acceso Rápido - Optimizado para tablets */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <QuickAccessPanel
            profileId={currentProfileId}
            voiceGender="female"
          />
        </div>

        {/* Frases Recientes - Mejor espaciado para tablets */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <RecentPhrases voiceGender="female" />
        </div>

        {/* Filtro de Categorías - Más grande en tablets */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Botones de Comunicación - Grid optimizado para tablets */}
        {communicationButtons.length > 0 && (
          <div className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
              Comunicación
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {communicationButtons.map(button => (
                <CommunicationButton
                  key={button.id}
                  button={button}
                  onClick={handleButtonSelect}
                  size={accessibilitySettings.buttonSize || 'large'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Botones de Cuentos - Mejor distribución para tablets */}
        {storyButtons.length > 0 && (
          <div className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
              Cuentos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
              {storyButtons.map(button => (
                <StoryButton key={button.id} button={button} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Mejor visualización en tablets */}
        {buttons.length === 0 && (
          <div className="text-center text-gray-600 text-xl sm:text-2xl md:text-3xl mt-10 sm:mt-16 md:mt-24 p-6 sm:p-8 md:p-12 bg-gray-50 rounded-2xl">
            <div className="mb-4">
              <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-gray-400" />
            </div>
            <p className="font-bold mb-2">No hay botones disponibles</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-500">
              Contacta con un administrador para agregar botones de comunicación
            </p>
          </div>
        )}
      </div>

        </>
      )}

      {/* Constructor de Frases (solo en modo constructor) */}
      {!directMode && (
        <PhraseBuilder
          selectedButtons={selectedButtons}
          onRemoveButton={handleRemoveButton}
          onClear={handleClearPhrase}
          voiceGender="female"
          profileId={currentProfileId}
          userId={firebaseUser?.uid || currentProfileId || 'default'}
        />
      )}
      

      {/* Modal de Estadísticas */}
      {showStats && currentProfileId && (
        <ProfileStats 
          profileId={currentProfileId}
          onClose={() => setShowStats(false)}
        />
      )}
      
      {/* Configuración de Accesibilidad */}
      {showAccessibilitySettings && (
        <AccessibilitySettings
          settings={accessibilitySettings}
          onChange={(newSettings) => {
            setAccessibilitySettings(newSettings);
            // Aquí podrías aplicar los cambios de configuración
            console.log('Configuración actualizada:', newSettings);
          }}
          onClose={() => setShowAccessibilitySettings(false)}
          userId={firebaseUser?.uid || currentProfileId || 'default'}
        />
      )}
      
      {/* Tutorial */}
      <Tutorial type="patient" />
    </div>
  );
}
