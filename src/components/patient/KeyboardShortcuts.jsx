import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function KeyboardShortcuts({
  onSearch,
  onSpeak,
  onClear,
  favorites = [],
  isOpen = true
}) {
  const { isDark } = useApp();
  const [showGuide, setShowGuide] = useState(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  useEffect(() => {
    if (!shortcutsEnabled) return;

    const handleKeyDown = (event) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl+F o Cmd+F - Abrir búsqueda
      if (ctrlKey && event.key === 'f') {
        event.preventDefault();
        onSearch?.();
      }

      // Ctrl+? - Mostrar guía de atajos
      if (ctrlKey && event.shiftKey && event.key === '?') {
        event.preventDefault();
        setShowGuide(!showGuide);
      }

      // Ctrl+Space - Hablar
      if (ctrlKey && event.code === 'Space') {
        event.preventDefault();
        onSpeak?.();
      }

      // Ctrl+L o Ctrl+N - Limpiar
      if (ctrlKey && (event.key === 'l' || event.key === 'n')) {
        event.preventDefault();
        onClear?.();
      }

      // Ctrl+0 a Ctrl+9 - Seleccionar favorito por número
      if (ctrlKey && /^[0-9]$/.test(event.key)) {
        event.preventDefault();
        const index = parseInt(event.key);
        if (index === 0) {
          // Ctrl+0 para el último
          if (favorites.length > 0) {
            onSearch?.(favorites[favorites.length - 1].text);
          }
        } else if (favorites[index - 1]) {
          onSearch?.(favorites[index - 1].text);
        }
      }

      // Alt+S - Alternar Síntesis de voz
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        // Esto sería manejado por un callback más específico
        console.log('Toggle speech synthesis');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onSpeak, onClear, favorites, shortcutsEnabled]);

  if (!isOpen) return null;

  return (
    <>
      {/* Guía de Atajos */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto`}>
            <div className="sticky top-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-inherit">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Atajos de Teclado</h2>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Búsqueda */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Búsqueda</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Abrir búsqueda</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+F</code>
                  </div>
                  <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Limpiar entrada</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+L</code>
                  </div>
                </div>
              </div>

              {/* Comunicación */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Comunicación</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Hablar (Síntesis de voz)</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+Space</code>
                  </div>
                  <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Alternar síntesis de voz</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Alt+S</code>
                  </div>
                </div>
              </div>

              {/* Favoritos */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Favoritos</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Usa Ctrl+1 a Ctrl+9 para acceder a tus primeros 9 favoritos:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                        <span className="text-xs">Favorito {i + 1}</span>
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                          Ctrl+{i + 1}
                        </code>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 mt-2">
                    <span className="text-xs">Último favorito</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+0</code>
                  </div>
                </div>
              </div>

              {/* Ayuda */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Ayuda</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>Mostrar esta guía</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl+Shift+?</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={shortcutsEnabled}
                  onChange={(e) => setShortcutsEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">Habilitar atajos de teclado</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante para mostrar guía */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowGuide(true)}
          className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          title="Atajos de teclado (Ctrl+Shift+?)"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
