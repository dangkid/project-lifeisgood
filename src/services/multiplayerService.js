/**
 * Servicio de Sesiones Multiplayer
 * Gestiona terapia grupal, salas compartidas, mensajes en tiempo real
 */

import { 
  db
} from '../config/firebase';
import {
  collection, 
  addDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

class MultiplayerService {
  /**
   * Crear una nueva sesión de terapia grupal
   */
  static async createSession(organizationId, createdBy, sessionData) {
    try {
      const sessionRef = await addDoc(
        collection(db, `organizations/${organizationId}/therapySessions`),
        {
          ...sessionData,
          createdBy,
          createdAt: serverTimestamp(),
          participants: [createdBy],
          messages: [],
          sharedButtons: [],
          status: 'active', // active, paused, completed
          maxParticipants: sessionData.maxParticipants || 10,
          code: this.generateSessionCode()
        }
      );
      
      return sessionRef.id;
    } catch (error) {
      console.error('Error creating therapy session:', error);
      throw error;
    }
  }

  /**
   * Unirse a una sesión con código
   */
  static async joinSession(organizationId, sessionCode, userId) {
    try {
      const sessionsRef = collection(db, `organizations/${organizationId}/therapySessions`);
      const q = query(sessionsRef, where('code', '==', sessionCode));
      
      let sessionId = null;
      
      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          unsubscribe();
          
          if (querySnapshot.empty) {
            reject(new Error('Session not found'));
            return;
          }

          sessionId = querySnapshot.docs[0].id;
          const sessionRef = doc(db, `organizations/${organizationId}/therapySessions/${sessionId}`);
          const sessionDoc = await getDoc(sessionRef);
          const sessionData = sessionDoc.data();

          // Verificar capacidad
          if (sessionData.participants.length >= sessionData.maxParticipants) {
            reject(new Error('Session is full'));
            return;
          }

          // Agregar participante
          await updateDoc(sessionRef, {
            participants: arrayUnion(userId)
          });

          resolve(sessionId);
        }, reject);
      });
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje en la sesión
   */
  static async sendMessage(organizationId, sessionId, userId, message) {
    try {
      const sessionRef = doc(db, `organizations/${organizationId}/therapySessions/${sessionId}`);
      
      const messageObj = {
        userId,
        message,
        timestamp: serverTimestamp(),
        type: 'text'
      };

      await updateDoc(sessionRef, {
        messages: arrayUnion(messageObj)
      });

      return messageObj;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Enviar botón compartido en la sesión
   */
  static async shareButton(organizationId, sessionId, userId, buttonData) {
    try {
      const sessionRef = doc(db, `organizations/${organizationId}/therapySessions/${sessionId}`);
      
      const sharedButton = {
        buttonId: buttonData.id,
        buttonText: buttonData.text,
        buttonImage: buttonData.image,
        sharedBy: userId,
        timestamp: serverTimestamp()
      };

      await updateDoc(sessionRef, {
        sharedButtons: arrayUnion(sharedButton),
        messages: arrayUnion({
          userId,
          message: `Compartió botón: ${buttonData.text}`,
          timestamp: serverTimestamp(),
          type: 'button_shared'
        })
      });

      return sharedButton;
    } catch (error) {
      console.error('Error sharing button:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de sesión en tiempo real
   */
  static subscribeToSession(organizationId, sessionId, callback) {
    try {
      const sessionRef = doc(db, `organizations/${organizationId}/therapySessions/${sessionId}`);
      
      return onSnapshot(sessionRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          callback(docSnapshot.data());
        }
      }, (error) => {
        console.error('Error subscripting to session:', error);
      });
    } catch (error) {
      console.error('Error in subscribeToSession:', error);
      throw error;
    }
  }

  /**
   * Salir de una sesión
   */
  static async leaveSession(organizationId, sessionId, userId) {
    try {
      const sessionRef = doc(db, `organizations/${organizationId}/therapySessions/${sessionId}`);
      
      await updateDoc(sessionRef, {
        participants: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  }

  /**
   * Terminar sesión (solo creador)
   */
  static async endSession(organizationId, sessionId, userId) {
    try {
      const sessionRef = doc(db, `organizations/${organizationId}/therapySessions/${sessionId}`);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.data().createdBy !== userId) {
        throw new Error('Only session creator can end session');
      }

      await updateDoc(sessionRef, {
        status: 'completed',
        endedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Generar código de sesión único
   */
  static generateSessionCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  /**
   * Obtener sesiones activas de una organización
   */
  static subscribeToActiveSessions(organizationId, callback) {
    try {
      const sessionsRef = collection(db, `organizations/${organizationId}/therapySessions`);
      const q = query(sessionsRef, where('status', '==', 'active'));
      
      return onSnapshot(q, (querySnapshot) => {
        const sessions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(sessions);
      });
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }
}

export default MultiplayerService;
