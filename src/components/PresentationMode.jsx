/**
 * Componente Modo Presentación
 * Muestra botones a pantalla completa para presentaciones
 */

import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

export default function PresentationMode({ buttons = [] }) {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);

  if (!isPresentationMode) {
    return (
      <button
        onClick={() => setIsPresentationMode(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Entrar en modo presentación"
      >
        <Maximize2 size={18} />
        Presentación
      </button>
    );
  }

  const currentButton = buttons[currentButtonIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center flex-col">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => {
            setIsPresentationMode(false);
            setCurrentButtonIndex(0);
          }}
          className="p-3 bg-white rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Botón actual - Muy grande */}
      {currentButton && (
        <div
          className="flex flex-col items-center justify-center w-3/4 h-3/4 rounded-2xl cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{
            backgroundColor: currentButton.color || '#3B82F6',
            backgroundImage: currentButton.image ? `url(${currentButton.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={() => {
            // Reproducir sonido si existe
            if (currentButton.audio) {
              new Audio(currentButton.audio).play();
            }
          }}
        >
          {currentButton.text && (
            <div className="text-white text-6xl font-bold text-center drop-shadow-lg">
              {currentButton.text}
            </div>
          )}
        </div>
      )}

      {/* Controles de navegación */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={() =>
            setCurrentButtonIndex(Math.max(0, currentButtonIndex - 1))
          }
          disabled={currentButtonIndex === 0}
          className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
        >
          ← Anterior
        </button>

        <div className="text-white flex items-center gap-2 px-6 py-3">
          <span className="text-lg">
            {currentButtonIndex + 1} / {buttons.length}
          </span>
        </div>

        <button
          onClick={() =>
            setCurrentButtonIndex(Math.min(buttons.length - 1, currentButtonIndex + 1))
          }
          disabled={currentButtonIndex === buttons.length - 1}
          className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
        >
          Siguiente →
        </button>
      </div>

      {/* Indicador de teclado */}
      <div className="absolute bottom-4 text-gray-400 text-sm">
        Usa ← → o haz click para navegar
      </div>
    </div>
  );
}
