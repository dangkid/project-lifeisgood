/**
 * Servicio de Sincronización entre Dispositivos
 * Mantiene datos sincronizados en tiempo real entre devices
 */

import { 
  db
} from '../config/firebase';
import {
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

class SyncService {
  /**
   * Registrar dispositivo activo
   */
  static async registerDevice(userId, organizationId, deviceInfo) {
    try {
      const userRef = doc(db, `users/${userId}`);
      
      await updateDoc(userRef, {
        [`devices.${deviceInfo.id}`]: {
          ...deviceInfo,
          lastActive: serverTimestamp(),
          isActive: true
        }
      });
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Desregistrar dispositivo
   */
  static async unregisterDevice(userId, deviceId) {
    try {
      const userRef = doc(db, `users/${userId}`);
      
      await updateDoc(userRef, {
        [`devices.${deviceId}.isActive`]: false,
        [`devices.${deviceId}.lastInactive`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios de otros dispositivos
   */
  static subscribeToDeviceSync(userId, callback) {
    try {
      const userRef = doc(db, `users/${userId}`);
      
      return onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const activeDevices = Object.entries(userData.devices || {})
            .filter(([_, device]) => device.isActive)
            .map(([_, device]) => device);
          
          callback(activeDevices);
        }
      });
    } catch (error) {
      console.error('Error in subscribeToDeviceSync:', error);
      throw error;
    }
  }

  /**
   * Sincronizar cambios entre dispositivos
   */
  static async syncButtonChanges(organizationId, deviceId, buttonChanges) {
    try {
      const syncRef = doc(db, `organizations/${organizationId}/deviceSync/${deviceId}`);
      
      await updateDoc(syncRef, {
        lastSync: serverTimestamp(),
        changes: buttonChanges,
        syncedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error syncing button changes:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios sincronizados
   */
  static subscribeToChanges(organizationId, callback) {
    try {
      const syncRef = collection(db, `organizations/${organizationId}/deviceSync`);
      
      return onSnapshot(syncRef, (querySnapshot) => {
        const changes = querySnapshot.docs.map(doc => ({
          deviceId: doc.id,
          ...doc.data()
        }));
        callback(changes);
      }, (error) => {
        console.error('Error in subscribeToChanges:', error);
      });
    } catch (error) {
      console.error('Error subscribing to changes:', error);
      throw error;
    }
  }

  /**
   * Obtener información de otros dispositivos activos
   */
  static async getActiveDevices(userId) {
    try {
      const userRef = doc(db, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      return Object.entries(userData.devices || {})
        .filter(([_, device]) => device.isActive)
        .map(([id, device]) => ({
          id,
          ...device
        }));
    } catch (error) {
      console.error('Error getting active devices:', error);
      return [];
    }
  }

  /**
   * Notificar otros dispositivos de cambios
   */
  static async notifyDevices(userId, organizationId, changeType, data) {
    try {
      const userRef = doc(db, `users/${userId}`);
      
      await updateDoc(userRef, {
        [`syncedChanges.${Date.now()}`]: {
          changeType,
          data,
          timestamp: serverTimestamp(),
          organizationId
        }
      });
    } catch (error) {
      console.error('Error notifying devices:', error);
      throw error;
    }
  }

  /**
   * Generar ID único para dispositivo
   */
  static generateDeviceId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default SyncService;
