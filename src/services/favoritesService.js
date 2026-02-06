/**
 * Servicio de Palabras Favoritas
 * Gestiona palabras/frases frecuentes y favoritas del usuario
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

class FavoritesService {
  /**
   * Agregar palabra a favoritos
   */
  async addFavorite(userId, profileId, text, category = 'general') {
    try {
      const favRef = collection(db, 'users', userId, 'favorites');
      
      await setDoc(doc(favRef), {
        text,
        category,
        profileId,
        createdAt: serverTimestamp(),
        usageCount: 0,
        isPinned: false
      });

      return { success: true };
    } catch (error) {
      console.error('Error agregando favorito:', error);
      throw error;
    }
  }

  /**
   * Obtener favoritos del usuario
   */
  async getFavorites(userId, profileId) {
    try {
      const favRef = collection(db, 'users', userId, 'favorites');
      const q = query(
        favRef,
        where('profileId', '==', profileId),
        orderBy('usageCount', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo favoritos:', error);
      return [];
    }
  }

  /**
   * Eliminar favorito
   */
  async removeFavorite(userId, favoriteId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', favoriteId));
      return { success: true };
    } catch (error) {
      console.error('Error eliminando favorito:', error);
      throw error;
    }
  }

  /**
   * Actualizar conteo de uso de favorito
   */
  async incrementUsage(userId, favoriteId) {
    try {
      const favRef = doc(db, 'users', userId, 'favorites', favoriteId);
      await updateDoc(favRef, {
        usageCount: increment(1),
        lastUsed: serverTimestamp()
      });
    } catch (error) {
      console.error('Error actualizando uso:', error);
    }
  }

  /**
   * Alternar pin (anclar/desanclar)
   */
  async togglePin(userId, favoriteId, isPinned) {
    try {
      const favRef = doc(db, 'users', userId, 'favorites', favoriteId);
      await updateDoc(favRef, {
        isPinned: !isPinned
      });
    } catch (error) {
      console.error('Error actualizando pin:', error);
      throw error;
    }
  }

  /**
   * Obtener frases frecuentes (basado en historial local)
   */
  getFrequentPhrases(recentCommunications, limit = 10) {
    const frequency = {};

    recentCommunications.forEach(comm => {
      frequency[comm.text] = (frequency[comm.text] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([text, count]) => ({ text, count }));
  }
}

export const favoritesService = new FavoritesService();
