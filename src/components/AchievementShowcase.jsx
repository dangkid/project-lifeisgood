import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Award } from 'lucide-react';
import AchievementService from '../services/achievementService';
import { useI18n } from '../services/i18nService';

export default function AchievementShowcase({ userId, organizationId }) {
  const { t } = useI18n();
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadAchievements();
    loadLeaderboard();
  }, [userId, organizationId]);

  const loadAchievements = async () => {
    try {
      const userAchievements = await AchievementService.getUserAchievements(userId);
      setAchievements(userAchievements);
      const points = userAchievements.reduce((sum, a) => sum + a.points, 0);
      setTotalPoints(points);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const board = await AchievementService.getOrganizationLeaderboard(organizationId, 10);
      setLeaderboard(board);
      
      const rank = await AchievementService.getUserRank(userId, organizationId);
      setUserRank(rank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBg = (rarity) => {
    const colors = {
      common: 'bg-gray-100 dark:bg-gray-700',
      rare: 'bg-blue-100 dark:bg-blue-900',
      epic: 'bg-purple-100 dark:bg-purple-900',
      legendary: 'bg-yellow-100 dark:bg-yellow-900'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="space-y-6">
      {/* Stats del usuario */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalPoints}</div>
            <div className="text-sm opacity-90">{t('achievements.points')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{achievements.length}</div>
            <div className="text-sm opacity-90">{t('achievements.achievements')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">#{userRank?.rank || '—'}</div>
            <div className="text-sm opacity-90">{t('leaderboard.position')}</div>
          </div>
        </div>
      </div>

      {/* Logros desbloqueados */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy size={24} />
          {t('achievements.unlockedAchievements')}
        </h3>
        {achievements.length === 0 ? (
          <p className="text-gray-500">{t('achievements.noAchievementsYet')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`${getRarityBg(achievement.rarity)} rounded-lg p-4 border-2 ${getRarityColor(achievement.rarity)}`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h4 className="font-bold text-gray-900 dark:text-white">{achievement.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase">{achievement.rarity}</span>
                  <span className="text-sm font-bold text-yellow-500">+{achievement.points}pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logros disponibles */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star size={24} />
          {t('achievements.availableAchievements')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AchievementService.getAvailableAchievements()
            .filter(a => !achievements.some(ua => ua.id === a.id))
            .map(achievement => (
              <div
                key={achievement.id}
                className={`${getRarityBg(achievement.rarity)} rounded-lg p-4 opacity-50 border-2 border-dashed ${getRarityColor(achievement.rarity)}`}
              >
                <div className="text-4xl mb-2 grayscale">{achievement.icon}</div>
                <h4 className="font-bold text-gray-900 dark:text-white">{achievement.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase opacity-60">{achievement.rarity}</span>
                  <span className="text-sm font-bold text-yellow-500">+{achievement.points}pts</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award size={24} />
          {t('leaderboard.title')}
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {leaderboard.map((user, idx) => (
            <div
              key={user.userId}
              className={`flex items-center justify-between p-4 border-b dark:border-gray-700 ${
                user.userId === userId ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-400 w-8">#{idx + 1}</div>
                {idx < 3 && (
                  <span className="text-2xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                )}
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.achievements} logros</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{user.points}</div>
                <div className="text-sm text-gray-500">pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
