import { useState, useEffect } from 'react';
import { Settings, Maximize2, Zap, Clock, Eye, Volume2, Gauge, Music, User } from 'lucide-react';
import { enhancedTtsService, setUserVoiceGender } from '../services/enhancedTtsService';

export default function AccessibilitySettings({ settings, onChange, onClose, userId = 'default' }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [voiceSettings, setVoiceSettings] = useState(enhancedTtsService.getSettings());
  const [availableVoices, setAvailableVoices] = useState([]);
  const [testText, setTestText] = useState('Hola, esto es una prueba de voz');
  const [userVoiceGender, setUserVoiceGender] = useState('female');

  useEffect(() => {
    // Cargar voces disponibles
    const voices = enhancedTtsService.getAvailableVoices();
    setAvailableVoices(voices);
    
    // Cargar preferencia de género del usuario
    const userPrefs = enhancedTtsService.getUserVoicePreference(userId);
    setUserVoiceGender(userPrefs.gender || 'female');
    
    // Si no hay voces, intentar cargarlas después de un tiempo
    if (voices.length === 0) {
      setTimeout(() => {
        const updatedVoices = enhancedTtsService.getAvailableVoices();
        setAvailableVoices(updatedVoices);
      }, 1000);
    }
  }, [userId]);

  const handleVoiceChange = (key, value) => {
    const newSettings = { ...voiceSettings, [key]: value };
    setVoiceSettings(newSettings);
    enhancedTtsService.updateSettings(newSettings);
    
    // Si cambia el género de voz, guardar preferencia del usuario
    if (key === 'voiceGender') {
      enhancedTtsService.setUserVoicePreference(userId, value);
      setUserVoiceGender(value);
    }
  };

  const handleTestVoice = async () => {
    try {
      await enhancedTtsService.speak(testText, {
        voiceGender: voiceSettings.voiceGender,
        userId: userId
      });
    } catch (error) {
      console.error('Error probando voz:', error);
    }
  };

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onChange(newSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Configuración de Accesibilidad</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Modo Barrido */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Modo Barrido Automático</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Los botones se resaltan automáticamente. Presiona cualquier tecla cuando esté resaltado el que quieres.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.scanningEnabled}
                onChange={(e) => handleChange('scanningEnabled', e.target.checked)}
                className="w-6 h-6 rounded border-gray-300"
              />
              <span className="text-lg font-medium">Activar Barrido</span>
            </label>
            
            {localSettings.scanningEnabled && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Velocidad del Barrido: {localSettings.scanSpeed / 1000}s
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={localSettings.scanSpeed}
                    onChange={(e) => handleChange('scanSpeed', parseInt(e.target.value))}
                    className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Rápido (0.5s)</span>
                    <span>Lento (3s)</span>
                  </div>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.groupScanning}
                    onChange={(e) => handleChange('groupScanning', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Barrido por Grupos (primero categorías)</span>
                </label>
              </div>
            )}
          </div>

          {/* Tamaño de Botones */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Maximize2 className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Tamaño de Botones</h3>
            </div>
            <div className="space-y-3">
              {['small', 'medium', 'large', 'xlarge'].map((size) => (
                <label key={size} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="buttonSize"
                    value={size}
                    checked={localSettings.buttonSize === size}
                    onChange={(e) => handleChange('buttonSize', e.target.value)}
                    className="w-5 h-5"
                  />
                  <span className="text-lg font-medium capitalize">
                    {size === 'small' && '📱 Pequeño'}
                    {size === 'medium' && '💻 Mediano'}
                    {size === 'large' && '🖥️ Grande'}
                    {size === 'xlarge' && '📺 Extra Grande (Recomendado)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Configuración de Voz */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Configuración de Voz</h3>
            </div>
            
            {/* Información del usuario */}
            <div className="mb-4 p-3 bg-indigo-100 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-700" />
                <span className="text-sm font-medium text-indigo-800">
                  Usuario: {userId === 'default' ? 'General' : userId}
                </span>
              </div>
              <p className="text-xs text-indigo-600 mt-1">
                La preferencia de voz se guardará para este usuario específicamente.
              </p>
            </div>
            
            {/* Género de Voz */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género de Voz
              </label>
              <div className="flex gap-4">
                {['female', 'male'].map((gender) => (
                  <label key={gender} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceGender"
                      value={gender}
                      checked={voiceSettings.voiceGender === gender}
                      onChange={(e) => handleVoiceChange('voiceGender', e.target.value)}
                      className="w-5 h-5"
                    />
                    <span className="text-lg font-medium capitalize">
                      {gender === 'female' ? '👩 Femenina (Recomendada)' : '👨 Masculina'}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                El sistema buscará la voz más natural disponible en tu navegador.
              </p>
            </div>

            {/* Velocidad del Habla */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Velocidad del Habla: {voiceSettings.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => handleVoiceChange('rate', parseFloat(e.target.value))}
                className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Lento (0.5x)</span>
                <span>Normal (1.0x)</span>
                <span>Rápido (2.0x)</span>
              </div>
            </div>

            {/* Volumen */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volumen: {Math.round(voiceSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) => handleVoiceChange('volume', parseFloat(e.target.value))}
                className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Bajo</span>
                <span>Normal</span>
                <span>Alto</span>
              </div>
            </div>

            {/* Prueba de Voz */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probar Voz
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Texto para probar la voz..."
                />
                <button
                  onClick={handleTestVoice}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Probar
                </button>
              </div>
              
              {/* Información de voces */}
              <div className="mt-3 space-y-2">
                {availableVoices.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">{availableVoices.length}</span> voces disponibles en el navegador
                    </p>
                    <div className="text-xs text-gray-600">
                      <p className="font-medium">Voces de alta calidad detectadas:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {availableVoices
                          .filter(v => v.lang.startsWith('es') || v.lang.includes('es-'))
                          .slice(0, 3)
                          .map((voice, index) => (
                            <li key={index} className="truncate">
                              {voice.name} ({voice.lang})
                            </li>
                          ))}
                      </ul>
                      {availableVoices.filter(v => v.lang.startsWith('es') || v.lang.includes('es-')).length > 3 && (
                        <p className="mt-1">... y {availableVoices.filter(v => v.lang.startsWith('es') || v.lang.includes('es-')).length - 3} más</p>
                      )}
                    </div>
                  </>
                )}
                
                {/* Consejos para mejor calidad */}
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <p className="font-medium">💡 Para voces más naturales:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Usa Chrome o Edge para mejores voces en español</li>
                    <li>Actualiza tu navegador a la última versión</li>
                    <li>Algunas voces premium pueden requerir configuración adicional</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Predicción de Palabras */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">Predicción Inteligente</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Sugiere las próximas palabras más probables según el contexto.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.predictionEnabled}
                onChange={(e) => handleChange('predictionEnabled', e.target.checked)}
                className="w-6 h-6 rounded border-gray-300"
              />
              <span className="text-lg font-medium">Activar Predicción</span>
            </label>
          </div>

          {/* Confirmación Visual */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-pink-600" />
              <h3 className="text-xl font-bold text-gray-900">Feedback Visual</h3>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.strongFeedback}
                onChange={(e) => handleChange('strongFeedback', e.target.checked)}
                className="w-6 h-6 rounded border-gray-300"
              />
              <span className="text-lg font-medium">Feedback Extra Fuerte (flash, sonido, vibración)</span>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t p-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-xl font-bold transition-colors"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
