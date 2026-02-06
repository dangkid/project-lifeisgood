/**
 * Componente de Dashboard Avanzado
 * Estadísticas, gráficos y análisis de progreso
 */

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react';
import AdvancedAnalyticsService from '../services/advancedAnalyticsService';
import { useI18n } from '../services/i18nService';

export default function AdvancedDashboard({ organizationId, userId }) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [organizationId, userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await AdvancedAnalyticsService.getOverallProgress(
        organizationId,
        userId
      );
      setProgress(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Botones Usados</div>
              <div className="text-3xl font-bold">{progress.totalButtonsUsed}</div>
            </div>
            <Zap size={32} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Total Clicks</div>
              <div className="text-3xl font-bold">{progress.totalButtonClicks}</div>
            </div>
            <BarChart3 size={32} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Precisión</div>
              <div className="text-3xl font-bold">{progress.gameAccuracy}%</div>
            </div>
            <TrendingUp size={32} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Categorías</div>
              <div className="text-3xl font-bold">{progress.categoriesExplored}</div>
            </div>
            <Users size={32} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Botones de actividad diaria */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Actividad Última Semana</h3>
        <div className="grid grid-cols-7 gap-2">
          {progress.dailyActivity.map((day, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div
                className="w-full h-16 rounded-lg flex items-center justify-center text-white font-bold transition-transform hover:scale-110"
                style={{
                  backgroundColor: day.buttons > 0 ? '#3B82F6' : '#E5E7EB',
                  opacity: day.buttons > 0 ? 0.6 + (day.buttons / 100) : 1
                }}
              >
                {day.buttons}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Tendencia: <span className={progress.activityTrend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {progress.activityTrend === 'up' ? '↑ Al alza' : progress.activityTrend === 'down' ? '↓ A la baja' : '→ Estable'}
          </span>
        </div>
      </div>

      {/* Botones más usados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Botones Top 5</h3>
          <div className="space-y-3">
            {progress.topButtonsUsed.map((button, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{button.buttonText}</div>
                  <div className="text-sm text-gray-500">{button.count} clicks</div>
                </div>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${(button.count / progress.topButtonsUsed[0].count) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Categorías Exploradas</h3>
          <div className="space-y-3">
            {progress.topCategories.map((category, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="font-semibold">{category.name}</div>
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-semibold">
                  {category.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón para exportar */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
          📊 Exportar a CSV
        </button>
        <button className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
          📄 Generar PDF
        </button>
      </div>
    </div>
  );
}
