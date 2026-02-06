/**
 * Servicio de Estadísticas de Comunicación
 * Rastrea y analiza patrones de uso del comunicador
 */

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

class CommunicationStatsService {
  /**
   * Registrar una palabra/frase comunicada
   */
  async recordCommunication(userId, profileId, text, category = 'general') {
    try {
      const statsRef = collection(db, 'users', userId, 'communicationStats');
      
      await setDoc(doc(statsRef), {
        text,
        category,
        profileId,
        timestamp: serverTimestamp(),
        length: text.length,
        wordCount: text.split(' ').length,
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      });

      // Actualizar estadísticas agregadas
      await this.updateAggregatedStats(userId, profileId, text, category);
    } catch (error) {
      console.error('Error registrando comunicación:', error);
      throw error;
    }
  }

  /**
   * Actualizar estadísticas agregadas (palabras frecuentes, etc)
   */
  async updateAggregatedStats(userId, profileId, text, category) {
    try {
      const statsDocRef = doc(db, 'users', userId, 'stats', 'aggregated');
      const statsDoc = await getDoc(statsDocRef);

      let wordFrequency = statsDoc.exists() ? statsDoc.data().wordFrequency || {} : {};
      
      // Actualizar frecuencia de palabras
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });

      // Actualizar documento
      await setDoc(statsDocRef, {
        lastUpdated: serverTimestamp(),
        totalCommunications: increment(1),
        totalWords: increment(text.split(' ').length),
        wordFrequency,
        profileId,
        category
      }, { merge: true });
    } catch (error) {
      console.error('Error actualizando stats agregadas:', error);
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId) {
    try {
      const statsDocRef = doc(db, 'users', userId, 'stats', 'aggregated');
      const statsDoc = await getDoc(statsDocRef);
      
      if (!statsDoc.exists()) {
        return {
          totalCommunications: 0,
          totalWords: 0,
          wordFrequency: {},
          averageMessageLength: 0
        };
      }

      return statsDoc.data();
    } catch (error) {
      console.error('Error obteniendo stats:', error);
      throw error;
    }
  }

  /**
   * Obtener palabras más frecuentes
   */
  async getTopWords(userId, limit = 10) {
    try {
      const stats = await this.getUserStats(userId);
      
      const sorted = Object.entries(stats.wordFrequency || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word, count]) => ({ word, count }));

      return sorted;
    } catch (error) {
      console.error('Error obteniendo palabras frecuentes:', error);
      throw error;
    }
  }

  /**
   * Obtener comunicaciones recientes
   */
  async getRecentCommunications(userId, profileId, days = 7) {
    try {
      const statsRef = collection(db, 'users', userId, 'communicationStats');
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const q = query(
        statsRef,
        where('profileId', '==', profileId),
        where('timestamp', '>=', cutoffDate),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error obteniendo comunicaciones recientes:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas por hora del día
   */
  async getStatsByHour(userId, profileId) {
    try {
      const communications = await this.getRecentCommunications(userId, profileId);
      const hourStats = {};

      communications.forEach(comm => {
        const hour = comm.hour || 0;
        hourStats[hour] = (hourStats[hour] || 0) + 1;
      });

      return hourStats;
    } catch (error) {
      console.error('Error obteniendo stats por hora:', error);
      throw error;
    }
  }

  /**
   * Obtener categorías más usadas
   */
  async getCategoryStats(userId, profileId) {
    try {
      const communications = await this.getRecentCommunications(userId, profileId);
      const categoryStats = {};

      communications.forEach(comm => {
        const category = comm.category || 'general';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });

      return categoryStats;
    } catch (error) {
      console.error('Error obteniendo stats por categoría:', error);
      throw error;
    }
  }
}

export const communicationStatsService = new CommunicationStatsService();
