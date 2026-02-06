/**
 * Servicio de Tableros Contextuales
 * Gestiona diferentes tableros según el contexto (Escuela, Casa, Médico, etc)
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

class ContextBoardService {
  // Contextos predefinidos con categorías recomendadas
  defaultContexts = {
    home: {
      name: 'Casa',
      icon: 'Home',
      color: 'blue',
      categories: ['saludos', 'familia', 'emociones', 'necesidades', 'actividades']
    },
    school: {
      name: 'Escuela',
      icon: 'BookOpen',
      color: 'purple',
      categories: ['saludos', 'educación', 'preguntas', 'emociones', 'necesidades']
    },
    medical: {
      name: 'Médico',
      icon: 'activity',
      color: 'red',
      categories: ['síntomas', 'dolor', 'medicinas', 'preguntas', 'emociones']
    },
    social: {
      name: 'Social',
      icon: 'Users',
      color: 'green',
      categories: ['saludos', 'emociones', 'conversación', 'humor', 'intereses']
    }
  };

  /**
   * Obtener contextos disponibles
   */
  getAvailableContexts() {
    return Object.entries(this.defaultContexts).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  /**
   * Obtener tablero para un contexto específico
   */
  async getContextBoard(userId, profileId, contextId) {
    try {
      const boardRef = doc(db, 'users', userId, 'contextBoards', contextId);
      const boardDoc = await getDoc(boardRef);

      if (boardDoc.exists()) {
        return boardDoc.data();
      }

      // Retornar configuración default si no existe
      return this.defaultContexts[contextId] || this.defaultContexts.home;
    } catch (error) {
      console.error('Error obteniendo tablero:', error);
      return this.defaultContexts.home;
    }
  }

  /**
   * Guardar tablero personalizado
   */
  async saveContextBoard(userId, contextId, boardData) {
    try {
      const boardRef = doc(db, 'users', userId, 'contextBoards', contextId);
      await setDoc(boardRef, {
        ...boardData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error guardando tablero:', error);
      throw error;
    }
  }

  /**
   * Obtener botones para un contexto
   */
  async getContextButtons(userId, profileId, contextId) {
    try {
      const board = await this.getContextBoard(userId, profileId, contextId);
      const categories = board.categories || [];

      // Aquí se filtraría de los botones globales
      return {
        contextId,
        categories,
        buttons: [] // Se llenarían desde getButtons filtrado
      };
    } catch (error) {
      console.error('Error obteniendo botones del contexto:', error);
      throw error;
    }
  }

  /**
   * Guardar contexto favorito
   */
  async setDefaultContext(userId, profileId, contextId) {
    try {
      const profileRef = doc(db, 'profiles', profileId);
      await updateDoc(profileRef, {
        defaultContext: contextId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error guardando contexto default:', error);
    }
  }

  /**
   * Obtener contexto favorito
   */
  async getDefaultContext(profileId) {
    try {
      const profileRef = doc(db, 'profiles', profileId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        return profileDoc.data().defaultContext || 'home';
      }
      return 'home';
    } catch (error) {
      console.error('Error obteniendo contexto default:', error);
      return 'home';
    }
  }
}

export const contextBoardService = new ContextBoardService();
