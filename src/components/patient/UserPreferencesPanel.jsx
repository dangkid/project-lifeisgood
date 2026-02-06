import { useState, useEffect } from 'react';
import { Settings, Volume2, RotateCcw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function UserPreferencesPanel({
  userId,
  onPreferencesChange,
  isOpen = true
}) {
  const { isDark } = useApp();
  const [preferences, setPreferences] = useState({
    fontSize: 'base',
    buttonSize: 'medium',
    buttonLayout: 'grid',
    soundEnabled: true,
    soundVolume: 80,
    textToSpeech: true,
    speechRate: 1,
    themeColor: 'blue',
    highContrast: false,
    reducedMotion: false,
    autoSuggest: true
  });

  useEffect(() => {
    // Cargar preferencias del localStorage
    const saved = localStorage.getItem('communicatorPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, [userId]);

  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('communicatorPreferences', JSON.stringify(updated));
    onPreferencesChange?.(updated);
  };

  const handleReset = () => {
    const defaults = {
      fontSize: 'base',
      buttonSize: 'medium',
      buttonLayout: 'grid',
      soundEnabled: true,
      soundVolume: 80,
      textToSpeech: true,
      speechRate: 1,
      themeColor: 'blue',
      highContrast: false,
      reducedMotion: false,
      autoSuggest: true
    };
    setPreferences(defaults);
    localStorage.setItem('communicatorPreferences', JSON.stringify(defaults));
    onPreferencesChange?.(defaults);
  };

  if (!isOpen) return null;

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-500" />
        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex-1">Preferencias</h3>
        <button
          onClick={handleReset}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Restaurar valores por defecto"
        >
          <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-6">
        {/* Display Settings */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Pantalla</h4>
          <div className="space-y-3">
            {/* Font Size */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                Tamaño de fuente
              </label>
              <select
                value={preferences.fontSize}
                onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                } text-sm`}
              >
                <option value="sm">Pequeño</option>
                <option value="base">Normal</option>
                <option value="lg">Grande</option>
                <option value="xl">Muy grande</option>
                <option value="2xl">Gigante</option>
              </select>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Vista previa: <span className={`text-${preferences.fontSize}`}>Ejemplo de texto</span>
              </p>
            </div>

            {/* Button Size */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                Tamaño de botones
              </label>
              <select
                value={preferences.buttonSize}
                onChange={(e) => handlePreferenceChange('buttonSize', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                } text-sm`}
              >
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
                <option value="extra">Extra grande</option>
              </select>
            </div>

            {/* Layout */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                Disposición de botones
              </label>
              <div className="flex gap-2">
                {['grid', 'list', 'carousel'].map(layout => (
                  <button
                    key={layout}
                    onClick={() => handlePreferenceChange('buttonLayout', layout)}
                    className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                      preferences.buttonLayout === layout
                        ? 'bg-purple-500 text-white'
                        : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                    }`}
                  >
                    {layout === 'grid' ? 'Cuadrícula' : layout === 'list' ? 'Lista' : 'Carrusel'}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Alto contraste</span>
            </label>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Sonido
          </h4>
          <div className="space-y-3">
            {/* Sound Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Efectos de sonido</span>
            </label>

            {/* Volume */}
            {preferences.soundEnabled && (
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Volumen: {preferences.soundVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preferences.soundVolume}
                  onChange={(e) => handlePreferenceChange('soundVolume', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Text to Speech */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.textToSpeech}
                onChange={(e) => handlePreferenceChange('textToSpeech', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Síntesis de voz</span>
            </label>

            {/* Speech Rate */}
            {preferences.textToSpeech && (
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Velocidad: {preferences.speechRate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.5"
                  value={preferences.speechRate}
                  onChange={(e) => handlePreferenceChange('speechRate', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Accesibilidad</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => handlePreferenceChange('reducedMotion', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Reducir movimiento</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoSuggest}
                onChange={(e) => handlePreferenceChange('autoSuggest', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-completado</span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-750' : 'bg-gray-50'} text-xs text-gray-600 dark:text-gray-400`}>
        Las preferencias se guardan automáticamente en tu dispositivo
      </div>
    </div>
  );
}
