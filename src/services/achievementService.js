/**
 * Servicio de Logros y Gamificación
 * Gestiona badges, achievements, leaderboards, challenges
 */

import { 
  db
} from '../config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const ACHIEVEMENTS = {
  // Logros básicos
  FIRST_STEPS: {
    id: 'first_steps',
    title: 'Primeros Pasos',
    description: 'Crea tu primer botón de comunicación',
    icon: '👣',
    points: 10,
    rarity: 'common'
  },
  COMMUNICATOR: {
    id: 'communicator',
    title: 'Comunicador',
    description: 'Usa 50 botones diferentes',
    icon: '💬',
    points: 25,
    rarity: 'common'
  },
  SPEED_TALKER: {
    id: 'speed_talker',
    title: 'Hablador Rápido',
    description: 'Construye una frase en menos de 5 segundos',
    icon: '⚡',
    points: 50,
    rarity: 'rare'
  },
  WORD_MASTER: {
    id: 'word_master',
    title: 'Maestro de Palabras',
    description: 'Usa 100 palabras diferentes',
    icon: '📚',
    points: 75,
    rarity: 'rare'
  },
  PERFECT_ACCURACY: {
    id: 'perfect_accuracy',
    title: 'Precisión Perfecta',
    description: 'Logra 100% de precisión en un juego',
    icon: '🎯',
    points: 100,
    rarity: 'epic'
  },
  SEVEN_DAY_STREAK: {
    id: 'seven_day_streak',
    title: 'Racha de Siete Días',
    description: 'Úsate 7 días seguidos',
    icon: '🔥',
    points: 150,
    rarity: 'epic'
  },
  GAME_CHAMPION: {
    id: 'game_champion',
    title: 'Campeón de Juegos',
    description: 'Gana todos los juegos educativos',
    icon: '👑',
    points: 200,
    rarity: 'legendary'
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    title: 'Mariposa Social',
    description: 'Participa en terapia grupal con 5 personas',
    icon: '🦋',
    points: 125,
    rarity: 'rare'
  },
  THERAPIST_FAVORITE: {
    id: 'therapist_favorite',
    title: 'Favorito del Terapeuta',
    description: 'Recibe 10 reacciones positivas',
    icon: '⭐',
    points: 175,
    rarity: 'epic'
  }
};

class AchievementService {
  /**
   * Obtener logros del usuario
   */
  static async getUserAchievements(userId) {
    try {
      const userRef = doc(db, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return [];
      }

      return userDoc.data().achievements || [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Desbloquear logro
   */
  static async unlockAchievement(userId, achievementId) {
    try {
      const achievement = ACHIEVEMENTS[achievementId];
      if (!achievement) {
        throw new Error('Achievement not found');
      }

      const userRef = doc(db, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Verificar si ya está desbloqueado
      const alreadyUnlocked = (userData.achievements || [])
        .some(a => a.id === achievementId);
      
      if (alreadyUnlocked) {
        return false;
      }

      // Desbloquear logro
      const newAchievement = {
        ...achievement,
        unlockedAt: serverTimestamp()
      };

      await updateDoc(userRef, {
        achievements: [...(userData.achievements || []), newAchievement],
        totalPoints: (userData.totalPoints || 0) + achievement.points
      });

      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  /**
   * Verificar y desbloquear logros automáticos
   */
  static async checkAndUnlockAchievements(userId, organizationId, stats) {
    try {
      const userRef = doc(db, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const unlockedIds = (userData.achievements || []).map(a => a.id);

      // Primeros pasos
      if (!unlockedIds.includes('FIRST_STEPS') && stats.buttonsCreated >= 1) {
        await this.unlockAchievement(userId, 'FIRST_STEPS');
      }

      // Comunicador (50 botones diferentes)
      if (!unlockedIds.includes('COMMUNICATOR') && stats.uniqueButtonsUsed >= 50) {
        await this.unlockAchievement(userId, 'COMMUNICATOR');
      }

      // Maestro de palabras (100 palabras)
      if (!unlockedIds.includes('WORD_MASTER') && stats.uniqueWordsUsed >= 100) {
        await this.unlockAchievement(userId, 'WORD_MASTER');
      }

      // Racha de 7 días
      if (!unlockedIds.includes('SEVEN_DAY_STREAK') && stats.currentStreak >= 7) {
        await this.unlockAchievement(userId, 'SEVEN_DAY_STREAK');
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  /**
   * Obtener leaderboard de una organización
   */
  static async getOrganizationLeaderboard(organizationId, limit_count = 10) {
    try {
      const membersRef = collection(db, `organizations/${organizationId}/members`);
      
      // Obtener todos los miembros
      const membersSnapshot = await getDocs(membersRef);
      
      // Obtener puntos de cada usuario
      const leaderboard = [];
      for (const memberDoc of membersSnapshot.docs) {
        const userId = memberDoc.id;
        const userRef = doc(db, `users/${userId}`);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          leaderboard.push({
            userId,
            name: memberDoc.data().name || 'Usuario',
            avatar: userDoc.data().profileImage || null,
            points: userDoc.data().totalPoints || 0,
            achievements: userDoc.data().achievements?.length || 0
          });
        }
      }

      // Ordenar por puntos
      return leaderboard
        .sort((a, b) => b.points - a.points)
        .slice(0, limit_count);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Obtener posición en el leaderboard
   */
  static async getUserRank(userId, organizationId) {
    try {
      const leaderboard = await this.getOrganizationLeaderboard(organizationId, 1000);
      const userIndex = leaderboard.findIndex(u => u.userId === userId);
      
      return {
        rank: userIndex + 1,
        totalUsers: leaderboard.length,
        points: leaderboard[userIndex]?.points || 0
      };
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  /**
   * Obtener lista de logros disponibles
   */
  static getAvailableAchievements() {
    return Object.values(ACHIEVEMENTS);
  }

  /**
   * Obtener detalles de un logro
   */
  static getAchievementDetails(achievementId) {
    return ACHIEVEMENTS[achievementId] || null;
  }

  /**
   * Agregar puntos bonus al usuario
   */
  static async addBonusPoints(userId, points, reason) {
    try {
      const userRef = doc(db, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      await updateDoc(userRef, {
        totalPoints: (userData.totalPoints || 0) + points,
        [`bonusHistory.${Date.now()}`]: {
          points,
          reason,
          timestamp: serverTimestamp()
        }
      });
    } catch (error) {
      console.error('Error adding bonus points:', error);
    }
  }
}

export default AchievementService;
