import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getButtons } from '../services/buttonService';
import { filterButtonsByContext, getTimeContext, getTimeContextLabel } from '../utils/timeContext';
import CommunicationButton from '../components/patient/CommunicationButton';
import StoryButton from '../components/patient/StoryButton';
import PhraseBuilder from '../components/patient/PhraseBuilder';
import { useScannerMode } from '../hooks/useScannerMode';
import { Clock, LogIn, Heart, Utensils, Home, Smile, Grid3x3, Moon, Sun, Scan } from 'lucide-react';

// Categorías disponibles
const CATEGORIES = [
  { id: 'all', name: 'Todo', icon: Grid3x3, color: 'bg-gray-700' },
  { id: 'necesidades', name: 'Necesidades', icon: Home, color: 'bg-blue-600' },
  { id: 'emociones', name: 'Emociones', icon: Heart, color: 'bg-pink-600' },
  { id: 'comida', name: 'Comida', icon: Utensils, color: 'bg-green-600' },
  { id: 'actividades', name: 'Actividades', icon: Smile, color: 'bg-purple-600' },
];

export default function PatientView() {
  const navigate = useNavigate();
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeContext, setTimeContext] = useState(getTimeContext());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [scannerEnabled, setScannerEnabled] = useState(false);

  // Manejar selección de botón para construcción de frase
  const handleButtonSelect = (button) => {
    setSelectedButtons([...selectedButtons, button]);
    // Haptic feedback en móviles
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleRemoveButton = (index) => {
    setSelectedButtons(selectedButtons.filter((_, i) => i !== index));
  };

  const handleClearPhrase = () => {
    setSelectedButtons([]);
  };

  // Filtrar botones por categoría
  const filterByCategory = (buttonsList) => {
    if (selectedCategory === 'all') return buttonsList;
    return buttonsList.filter(b => b.category === selectedCategory);
  };

  // Separate buttons by type
  const communicationButtons = filterByCategory(buttons.filter(b => b.type === 'communication'));
  const storyButtons = buttons.filter(b => b.type === 'story');

  // Scanner mode
  const { currentIndex, handleSelection } = useScannerMode(
    communicationButtons,
    scannerEnabled
  );

  // Load buttons from Firebase
  useEffect(() => {
    loadButtons();
  }, []);

  // Update time context every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      const newContext = getTimeContext();
      if (newContext !== timeContext) {
        setTimeContext(newContext);
        loadButtons(); // Reload buttons when context changes
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [timeContext]);

  const loadButtons = async () => {
    try {
      setLoading(true);
      const allButtons = await getButtons();
      const filteredButtons = filterButtonsByContext(allButtons);
      setButtons(filteredButtons);
    } catch (error) {
      console.error('Error loading buttons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar tecla espaciadora para modo escáner
  useEffect(() => {
    if (!scannerEnabled) return;

    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        const selectedButton = handleSelection();
        if (selectedButton) {
          handleButtonSelect(selectedButton);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scannerEnabled, handleSelection, selectedButtons]);


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-6xl font-bold">Cargando...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-900 via-black to-gray-900'} pb-32`}>
      {/* Navbar */}
      <nav className={`${darkMode ? 'bg-gray-950' : 'bg-gray-800'} border-b border-gray-700 shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo/Título */}
            <div className="flex items-center gap-4">
              <h1 className="text-white text-3xl md:text-4xl font-bold">
                AAC Comunicador
              </h1>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3">
              {/* Modo Escáner */}
              <button
                onClick={() => setScannerEnabled(!scannerEnabled)}
                className={`p-3 rounded-lg transition-colors ${
                  scannerEnabled 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                title="Modo Escáner (Presiona Espacio para seleccionar)"
              >
                <Scan size={24} />
              </button>

              {/* Selector de voz */}
              <div className="hidden md:flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
                <button
                  onClick={() => setVoiceGender('female')}
                  className={`px-3 py-1 rounded ${voiceGender === 'female' ? 'bg-pink-500 text-white' : 'text-gray-300'}`}
                >
                  👩 Mujer
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={`px-3 py-1 rounded ${voiceGender === 'male' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                >
                  👨 Hombre
                </button>
              </div>

              {/* Toggle modo oscuro */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>

              {/* Botón Admin */}
              <button
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-3 bg-primary hover:bg-primary-dark 
                           text-white px-6 py-3 rounded-lg transition-all
                           focus:outline-none focus:ring-4 focus:ring-primary text-xl font-medium
                           shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-6 h-6" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="p-4 md:p-8">
        {/* Time Context Indicator */}
        <div className="mb-6 bg-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-center gap-4">
            <Clock className="w-12 h-12 text-primary" />
            <div className="text-center">
              <p className="text-white text-3xl font-bold">
                {getTimeContextLabel(timeContext)}
              </p>
              <p className="text-gray-400 text-2xl">
                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg whitespace-nowrap
                  transition-all transform hover:scale-105
                  ${selectedCategory === category.id 
                    ? `${category.color} text-white shadow-lg scale-105` 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                <Icon size={24} />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Communication Buttons Grid */}
        {communicationButtons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white text-5xl font-bold mb-6 text-center">
              ¿Qué necesitas?
            </h2>
            {scannerEnabled && (
              <div className="mb-4 text-center bg-green-600 text-white py-3 rounded-lg text-xl font-bold">
                Modo Escáner Activado - Presiona ESPACIO para seleccionar
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {communicationButtons.map((button, index) => (
                <div 
                  key={button.id}
                  className={`
                    transition-all duration-300
                    ${scannerEnabled && index === currentIndex 
                      ? 'ring-8 ring-yellow-400 scale-110 z-10' 
                      : ''
                    }
                  `}
                >
                  <CommunicationButton 
                    button={button}
                    onClick={handleButtonSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Story Buttons Section */}
      {storyButtons.length > 0 && (
        <div className="mt-12">
          <h2 className="text-white text-5xl font-bold mb-6 text-center">
            Historias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storyButtons.map(button => (
              <StoryButton key={button.id} button={button} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {buttons.length === 0 && (
        <div className="text-center text-white text-4xl mt-20">
          <p>No hay botones disponibles en este momento</p>
          <p className="text-2xl text-gray-400 mt-4">
            ({getTimeContextLabel(timeContext)})
          </p>
        </div>
      )}
      </div>

      {/* Constructor de Frases */}
      <PhraseBuilder 
        selectedButtons={selectedButtons}
        onRemoveButton={handleRemoveButton}
        onClear={handleClearPhrase}
        voiceGender={voiceGender}
      />
    </div>
  );
}
