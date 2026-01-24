import { useState } from 'react';
import { Settings, Maximize2, Zap, Clock, Eye } from 'lucide-react';

export default function AccessibilitySettings({ settings, onChange, onClose }) {
  const [localSettings, setLocalSettings] = useState(settings);

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
