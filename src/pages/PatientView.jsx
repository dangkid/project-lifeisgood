import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getButtons } from '../services/buttonService';
import CommunicationButton from '../components/patient/CommunicationButton';
import StoryButton from '../components/patient/StoryButton';
import PhraseBuilder from '../components/patient/PhraseBuilder';
import { LogIn } from 'lucide-react';

export default function PatientView() {
  const navigate = useNavigate();
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedButtons, setSelectedButtons] = useState([]);

  useEffect(() => {
    loadButtons();
  }, []);

  const loadButtons = async () => {
    try {
      setLoading(true);
      const allButtons = await getButtons();
      setButtons(allButtons);
    } catch (error) {
      console.error('Error loading buttons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonSelect = (button) => {
    setSelectedButtons([...selectedButtons, button]);
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

  const communicationButtons = buttons.filter(b => b.type === 'communication');
  const storyButtons = buttons.filter(b => b.type === 'story');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-800 text-4xl font-bold">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      {/* Header Simple */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            AAC Comunicador
          </h1>
          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <LogIn size={20} />
            Admin
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Botones de Comunicación */}
        {communicationButtons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Comunicación
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cuentos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Constructor de Frases */}
      <PhraseBuilder 
        selectedButtons={selectedButtons}
        onRemoveButton={handleRemoveButton}
        onClear={handleClearPhrase}
        voiceGender="female"
      />
    </div>
  );
}
