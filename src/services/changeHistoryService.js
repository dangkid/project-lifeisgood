/**
 * Servicio para rastrear historial de cambios en documentos
 * Similar a Git - ver antes y después de cambios
 */

import { 
  db
} from '../config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

class ChangeHistoryService {
  /**
   * Registrar un cambio de documento
   */
  static async recordChange(organizationId, documentType, documentId, userId, changes, before, after) {
    try {
      await addDoc(
        collection(db, `organizations/${organizationId}/changeHistory`),
        {
          documentType,
          documentId,
          userId,
          changes, // Array de cambios: [{ field, oldValue, newValue }, ...]
          beforeState: before,
          afterState: after,
          timestamp: serverTimestamp(),
          description: this.generateDescription(documentType, changes)
        }
      );
    } catch (error) {
      console.error('Error recording change:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de un documento
   */
  static subscribeToDocumentHistory(organizationId, documentType, documentId, callback) {
    try {
      const q = query(
        collection(db, `organizations/${organizationId}/changeHistory`),
        where('documentType', '==', documentType),
        where('documentId', '==', documentId),
        orderBy('timestamp', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(history);
      });
    } catch (error) {
      console.error('Error in subscribeToDocumentHistory:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de un usuario
   */
  static subscribeToUserHistory(organizationId, userId, callback) {
    try {
      const q = query(
        collection(db, `organizations/${organizationId}/changeHistory`),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(history);
      });
    } catch (error) {
      console.error('Error in subscribeToUserHistory:', error);
      throw error;
    }
  }

  /**
   * Generar descripción legible del cambio
   */
  static generateDescription(documentType, changes) {
    if (!changes || changes.length === 0) {
      return `${documentType} creado`;
    }

    const changeDescriptions = changes.map(change => {
      if (change.field === '_delete') {
        return `${documentType} eliminado`;
      }
      return `${change.field} cambió de "${change.oldValue}" a "${change.newValue}"`;
    });

    return changeDescriptions.join(', ');
  }

  /**
   * Detectar cambios entre dos objetos
   */
  static detectChanges(before, after) {
    const changes = [];

    for (const key in after) {
      if (!(key in before)) {
        changes.push({
          field: key,
          oldValue: null,
          newValue: after[key],
          type: 'added'
        });
      } else if (before[key] !== after[key]) {
        changes.push({
          field: key,
          oldValue: before[key],
          newValue: after[key],
          type: 'modified'
        });
      }
    }

    for (const key in before) {
      if (!(key in after)) {
        changes.push({
          field: key,
          oldValue: before[key],
          newValue: null,
          type: 'removed'
        });
      }
    }

    return changes;
  }
}

export default ChangeHistoryService;
