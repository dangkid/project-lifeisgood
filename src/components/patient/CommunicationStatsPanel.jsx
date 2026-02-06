import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Tag } from 'lucide-react';
import { communicationStatsService } from '../../services/communicationStatsService';
import { useApp } from '../../contexts/AppContext';

export default function CommunicationStatsPanel({
  userId,
  profileId,
  isOpen = true
}) {
  const { isDark } = useApp();
  const [stats, setStats] = useState({
    totalCommunications: 0,
    topWords: [],
    statsByHour: [],
    categoryStats: [],
    recentCommunications: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('words');

  useEffect(() => {
    loadStats();
  }, [userId, profileId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [
        total,
        topWords,
        byHour,
        categoryStats,
        recent
      ] = await Promise.all([
        communicationStatsService.getUserStats(userId),
        communicationStatsService.getTopWords(userId, 10),
        communicationStatsService.getStatsByHour(userId, profileId),
        communicationStatsService.getCategoryStats(userId, profileId),
        communicationStatsService.getRecentCommunications(userId, profileId, 7)
      ]);

      setStats({
        totalCommunications: total?.totalCount || 0,
        topWords: topWords || [],
        statsByHour: byHour || [],
        categoryStats: categoryStats || [],
        recentCommunications: recent || []
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxWordCount = Math.max(...(stats.topWords.map(w => w.count) || [1]));

  if (!isOpen) return null;

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Estadísticas</h3>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalCommunications}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Palabras únicas</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.topWords.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'words', label: 'Palabras', icon: TrendingUp },
          { id: 'time', label: 'Tiempo', icon: Clock },
          { id: 'categories', label: 'Categorías', icon: Tag }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center gap-1 border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : `border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Cargando estadísticas...
          </div>
        ) : selectedTab === 'words' ? (
          <div className="space-y-2">
            {stats.topWords.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Sin datos de palabras aún
              </p>
            ) : (
              stats.topWords.map((word, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {word.word}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {word.count}x
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${(word.count / maxWordCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : selectedTab === 'time' ? (
          <div className="space-y-2">
            {stats.statsByHour.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Sin datos horarios aún
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {stats.statsByHour.map((stat, idx) => {
                  const maxCount = Math.max(...stats.statsByHour.map(s => s.count || 0), 1);
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-t flex items-end justify-center">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t transition-all"
                          style={{ height: `${(stat.count / maxCount) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {stat.hour}h
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {stats.categoryStats.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Sin datos de categorías aún
              </p>
            ) : (
              stats.categoryStats.map((cat, idx) => {
                const maxCat = Math.max(...stats.categoryStats.map(c => c.count || 0), 1);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {cat.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {cat.count}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                        style={{ width: `${(cat.count / maxCat) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
        <button
          onClick={loadStats}
          className="w-full py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Actualizar datos
        </button>
      </div>
    </div>
  );
}
