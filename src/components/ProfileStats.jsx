import { useState, useEffect } from 'react';
import { getProfileStats } from '../services/profileService';
import { BarChart3, TrendingUp, MousePointer, MessageSquare, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function ProfileStats({ profileId, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [profileId]);

  const loadStats = async () => {
    if (!profileId) return;
    
    setLoading(true);
    try {
      const data = await getProfileStats(profileId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <LoadingSpinner text="Cargando estadísticas" size="medium" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Estadísticas</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Resumen General */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Total de Frases */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-800">Frases Creadas</h3>
            </div>
            <p className="text-4xl font-bold text-blue-900">{stats.total_phrases}</p>
          </div>

          {/* Total de Clics */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <MousePointer className="w-8 h-8 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-800">Botones Presionados</h3>
            </div>
            <p className="text-4xl font-bold text-purple-900">{stats.total_button_clicks}</p>
          </div>
        </div>

        {/* Botones Más Usados */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">Botones Más Usados</h3>
          </div>

          {stats.most_used_buttons.length > 0 ? (
            <div className="space-y-3">
              {stats.most_used_buttons.map((button, index) => (
                <div 
                  key={button.id}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{button.text}</p>
                        <p className="text-sm text-gray-500">{button.count} veces</p>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ 
                            width: `${(button.count / stats.most_used_buttons[0].count) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-600 w-12 text-right">
                        {button.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
              <p>Aún no hay datos de uso</p>
              <p className="text-sm">Comienza a usar botones para ver estadísticas</p>
            </div>
          )}
        </div>

        {/* Última actividad */}
        {stats.last_active && (
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Última actividad:</span>{' '}
              {stats.last_active.toDate?.().toLocaleString('es-ES') || 'N/A'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
