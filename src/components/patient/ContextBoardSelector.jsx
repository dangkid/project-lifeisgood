import { useState, useEffect } from 'react';
import { Home, BookOpen, Stethoscope, Users } from 'lucide-react';
import { contextBoardService } from '../../services/contextBoardService.js';
import { useApp } from '../../contexts/AppContext';

export default function ContextBoardSelector({
  userId,
  profileId,
  onContextChange,
  isOpen = true
}) {
  const { isDark } = useApp();
  const [currentContext, setCurrentContext] = useState('home');
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContexts();
  }, [userId, profileId]);

  const loadContexts = async () => {
    try {
      setLoading(true);
      const availableContexts = contextBoardService.getAvailableContexts();
      setContexts(availableContexts);
      
      // Obtener contexto predeterminado
      const defaultCtx = await contextBoardService.getDefaultContext(profileId);
      if (defaultCtx) {
        setCurrentContext(defaultCtx);
      }
    } catch (error) {
      console.error('Error cargando contextos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContextChange = async (contextId) => {
    try {
      setCurrentContext(contextId);
      await contextBoardService.setDefaultContext(userId, profileId, contextId);
      onContextChange(contextId);
    } catch (error) {
      console.error('Error cambiando contexto:', error);
    }
  };

  const getContextIcon = (contextId) => {
    switch (contextId) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'school':
        return <BookOpen className="w-5 h-5" />;
      case 'medical':
        return <Stethoscope className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getContextLabel = (contextId) => {
    const labels = {
      home: 'Casa',
      school: 'Escuela',
      medical: 'Médico',
      social: 'Social'
    };
    return labels[contextId] || contextId;
  };

  const getContextColor = (contextId) => {
    const colors = {
      home: 'from-blue-500 to-blue-600',
      school: 'from-purple-500 to-purple-600',
      medical: 'from-green-500 to-green-600',
      social: 'from-pink-500 to-pink-600'
    };
    return colors[contextId] || 'from-gray-500 to-gray-600';
  };

  if (!isOpen) return null;

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Contextos</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Elige un contexto para personalizar</p>
      </div>

      <div className="p-3 grid grid-cols-2 gap-2">
        {loading ? (
          <div className="col-span-2 py-4 text-center text-gray-500 dark:text-gray-400">
            Cargando contextos...
          </div>
        ) : contexts.length === 0 ? (
          <div className="col-span-2 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No hay contextos disponibles
          </div>
        ) : (
          contexts.map(ctx => (
            <button
              key={ctx.id}
              onClick={() => handleContextChange(ctx.id)}
              className={`relative p-4 rounded-lg transition-all transform hover:scale-105 ${
                currentContext === ctx.id
                  ? `bg-gradient-to-br ${getContextColor(ctx.id)} text-white shadow-lg ring-2 ring-offset-2 ${isDark ? 'ring-offset-gray-800' : 'ring-offset-white'} ring-white`
                  : `${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-gray-900 dark:text-gray-100`
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {getContextIcon(ctx.id)}
                <span className="font-medium text-sm">{getContextLabel(ctx.id)}</span>
              </div>
              {currentContext === ctx.id && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Resumen del contexto actual */}
      {!loading && currentContext && (
        <div className={`px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Contexto activo:</strong> {getContextLabel(currentContext)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Los botones se adaptarán a este contexto
          </p>
        </div>
      )}
    </div>
  );
}
