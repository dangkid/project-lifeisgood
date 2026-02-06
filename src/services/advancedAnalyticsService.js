/**
 * Servicio de Dashboard Avanzado
 * Estadísticas, gráficos, reportes de progreso
 */

import { db } from '../config/firebase';
import { 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

class AdvancedAnalyticsService {
  /**
   * Obtener estadísticas de uso de botones
   */
  static async getButtonUsageStats(organizationId, userId, daysBack = 30) {
    try {
      if (!organizationId || !userId) return [];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const statsRef = collection(db, `organizations/${organizationId}/buttonStats`);
      const q = query(
        statsRef,
        where('userId', '==', userId),
        where('timestamp', '>=', startDate)
      );

      const snapshot = await getDocs(q);
      const stats = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!stats[data.buttonId]) {
          stats[data.buttonId] = {
            buttonId: data.buttonId,
            buttonText: data.buttonText,
            count: 0,
            lastUsed: null
          };
        }
        stats[data.buttonId].count++;
        stats[data.buttonId].lastUsed = data.timestamp;
      });

      return Object.values(stats)
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      // Silently return empty array on permission errors
      if (error.code === 'permission-denied') {
        console.warn('No permission to access button stats');
        return [];
      }
      console.error('Error getting button usage stats:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas diarias de actividad
   */
  static async getDailyActivityStats(organizationId, userId, daysBack = 7) {
    try {
      const stats = {};
      
      // Crear entrada para cada día
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        stats[dateKey] = {
          date: dateKey,
          phrases: 0,
          buttons: 0,
          time: 0
        };
      }

      // Aquí irían consultas a Firestore para obtener datos reales
      // Por ahora retornamos estructura vacía

      return Object.values(stats);
    } catch (error) {
      console.error('Error getting daily activity stats:', error);
      return [];
    }
  }

  /**
   * Obtener categorías más usadas
   */
  static async getCategoryStats(organizationId, userId) {
    try {
      if (!organizationId || !userId) return [];
      
      const categories = {};
      
      // Consultar botones usados
      const usageRef = collection(db, `organizations/${organizationId}/buttonStats`);
      const q = query(usageRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const category = data.category || 'Sin categoría';
        categories[category] = (categories[category] || 0) + 1;
      });

      return Object.entries(categories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      // Silently return empty array on permission errors
      if (error.code === 'permission-denied') {
        console.warn('No permission to access category stats');
        return [];
      }
      console.error('Error getting category stats:', error);
      return [];
    }
  }

  /**
   * Calcular precisión en juegos
   */
  static async getGameAccuracy(organizationId, userId) {
    try {
      if (!organizationId || !userId) return 0;
      
      const scoresRef = collection(db, `organizations/${organizationId}/gameScores`);
      const q = query(scoresRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      let totalAttempts = 0;
      let correctAnswers = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalAttempts += data.totalQuestions || 0;
        correctAnswers += data.correctAnswers || 0;
      });

      return totalAttempts > 0 
        ? Math.round((correctAnswers / totalAttempts) * 100)
        : 0;
    } catch (error) {
      // Silently return 0 on permission errors
      if (error.code === 'permission-denied') {
        console.warn('No permission to access game scores');
        return 0;
      }
      console.error('Error getting game accuracy:', error);
      return 0;
    }
  }

  /**
   * Obtener progreso general
   */
  static async getOverallProgress(organizationId, userId) {
    try {
      const [
        buttonUsage,
        categoryStats,
        gameAccuracy,
        dailyActivity
      ] = await Promise.all([
        this.getButtonUsageStats(organizationId, userId),
        this.getCategoryStats(organizationId, userId),
        this.getGameAccuracy(organizationId, userId),
        this.getDailyActivityStats(organizationId, userId)
      ]);

      return {
        totalButtonsUsed: buttonUsage.length,
        totalButtonClicks: buttonUsage.reduce((sum, b) => sum + b.count, 0),
        topButtonsUsed: buttonUsage.slice(0, 5),
        categoriesExplored: categoryStats.length,
        topCategories: categoryStats.slice(0, 5),
        gameAccuracy,
        dailyActivity,
        activityTrend: this.calculateTrend(dailyActivity)
      };
    } catch (error) {
      console.error('Error getting overall progress:', error);
      return null;
    }
  }

  /**
   * Calcular tendencia (al alza o a la baja)
   */
  static calculateTrend(dailyActivity) {
    if (dailyActivity.length < 2) return 'neutral';

    const firstHalf = dailyActivity
      .slice(0, Math.floor(dailyActivity.length / 2))
      .reduce((sum, day) => sum + (day.buttons || 0), 0);

    const secondHalf = dailyActivity
      .slice(Math.floor(dailyActivity.length / 2))
      .reduce((sum, day) => sum + (day.buttons || 0), 0);

    if (secondHalf > firstHalf) return 'up';
    if (secondHalf < firstHalf) return 'down';
    return 'neutral';
  }

  /**
   * Generar reporte PDF
   */
  static async generatePDFReport(organizationId, userId, data) {
    // Esto requeriría una librería como jsPDF
    // Por ahora es un placeholder
    const report = {
      timestamp: new Date(),
      userId,
      organizationId,
      data
    };
    return report;
  }

  /**
   * Exportar datos a CSV
   */
  static async exportToCSV(organizationId, userId) {
    try {
      const progress = await this.getOverallProgress(organizationId, userId);
      
      let csv = 'Botones Usados, Clickes, Categoría\n';
      progress.topButtonsUsed.forEach(button => {
        csv += `"${button.buttonText}",${button.count}\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return null;
    }
  }
}

export default AdvancedAnalyticsService;
