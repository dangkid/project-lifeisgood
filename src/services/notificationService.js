/**
 * Servicio de Notificaciones en Tiempo Real
 * Maneja notificaciones para usuarios y organizaciones
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ============================================================
// CREAR NOTIFICACIONES
// ============================================================

/**
 * Crear notificación para un usuario
 */
export const createNotification = async (userId, notification) => {
  if (!userId) throw new Error('userId requerido');
  
  try {
    const notifData = {
      type: notification.type, // 'user_joined', 'button_created', 'profile_updated', etc
      message: notification.message,
      read: false,
      createdAt: serverTimestamp(),
      data: notification.data || {}, // Datos relacionados
      relatedId: notification.relatedId || null // ID de lo que se modificó
    };

    const docRef = await addDoc(
      collection(db, 'users', userId, 'notifications'),
      notifData
    );

    console.log('✅ Notificación creada:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creando notificación:', error);
    throw error;
  }
};

/**
 * Crear notificación para todos los miembros de una organización
 */
export const notifyOrganizationMembers = async (organizationId, notification, excludeUserId = null) => {
  try {
    const membersSnapshot = await getDocs(
      collection(db, 'organizations', organizationId, 'members')
    );

    const promises = membersSnapshot.docs.map(async (memberDoc) => {
      const userId = memberDoc.id;
      
      // No notificar al usuario que causó la acción
      if (excludeUserId && userId === excludeUserId) {
        return null;
      }

      return createNotification(userId, notification);
    });

    await Promise.all(promises);
    console.log(`✅ Notificaciones enviadas a ${membersSnapshot.size} miembros`);
  } catch (error) {
    console.error('❌ Error notificando miembros:', error);
    throw error;
  }
};

// ============================================================
// LEER NOTIFICACIONES (En tiempo real)
// ============================================================

/**
 * Suscribirse a notificaciones de un usuario (tiempo real)
 */
export const subscribeToNotifications = (userId, callback) => {
  if (!userId) return () => {};

  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20) // Últimas 20 notificaciones
    );

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));

      callback(notifications);
    }, (error) => {
      console.error('❌ Error en suscripción:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error suscribiendo:', error);
    throw error;
  }
};

/**
 * Obtener notificaciones de un usuario (una sola vez)
 */
export const getNotifications = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
  } catch (error) {
    console.error('❌ Error obteniendo notificaciones:', error);
    throw error;
  }
};

/**
 * Contar notificaciones no leídas
 */
export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error contando no leídas:', error);
    return 0;
  }
};

// ============================================================
// ACTUALIZAR NOTIFICACIONES
// ============================================================

/**
 * Marcar notificación como leída
 */
export const markAsRead = async (userId, notificationId) => {
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notifRef, {
      read: true,
      readAt: serverTimestamp()
    });

    console.log('✅ Notificación marcada como leída');
  } catch (error) {
    console.error('❌ Error marcando como leída:', error);
    throw error;
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = async (userId) => {
  try {
    const notifs = await getNotifications(userId, 100);
    
    const promises = notifs
      .filter(n => !n.read)
      .map(n => markAsRead(userId, n.id));

    await Promise.all(promises);
    console.log('✅ Todas las notificaciones marcadas como leídas');
  } catch (error) {
    console.error('❌ Error marcando todas:', error);
    throw error;
  }
};

// ============================================================
// ELIMINAR NOTIFICACIONES
// ============================================================

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (userId, notificationId) => {
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
    await deleteDoc(notifRef);

    console.log('✅ Notificación eliminada');
  } catch (error) {
    console.error('❌ Error eliminando notificación:', error);
    throw error;
  }
};

/**
 * Limpiar notificaciones antiguas (más de 30 días)
 */
export const cleanOldNotifications = async (userId) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const notifs = await getNotifications(userId, 100);
    
    const oldNotifs = notifs.filter(n => {
      const notifDate = n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt);
      return notifDate < thirtyDaysAgo;
    });

    const promises = oldNotifs.map(n => deleteNotification(userId, n.id));
    await Promise.all(promises);

    console.log(`✅ ${oldNotifs.length} notificaciones antiguas eliminadas`);
  } catch (error) {
    console.error('❌ Error limpiando antiguas:', error);
    throw error;
  }
};

// ============================================================
// TIPOS DE NOTIFICACIONES
// ============================================================

/**
 * Tipos de notificaciones disponibles
 */
export const NOTIFICATION_TYPES = {
  // Usuarios
  USER_JOINED: 'user_joined',           // Nuevo miembro en org
  USER_ROLE_CHANGED: 'user_role_changed', // Rol cambió
  
  // Botones
  BUTTON_CREATED: 'button_created',     // Botón nuevo
  BUTTON_UPDATED: 'button_updated',     // Botón actualizado
  BUTTON_DELETED: 'button_deleted',     // Botón borrado
  
  // Perfiles
  PROFILE_CREATED: 'profile_created',   // Perfil nuevo
  PROFILE_UPDATED: 'profile_updated',   // Perfil actualizado
  PROFILE_DELETED: 'profile_deleted',   // Perfil borrado
  
  // Organización
  ORG_CREATED: 'org_created',           // Org creada
  ORG_UPDATED: 'org_updated',           // Org actualizada
  
  // Sistema
  SYSTEM_MESSAGE: 'system_message',     // Mensaje del sistema
};

/**
 * Crear notificación de botón creado
 */
export const notifyButtonCreated = async (organizationId, button, creatorId) => {
  return notifyOrganizationMembers(organizationId, {
    type: NOTIFICATION_TYPES.BUTTON_CREATED,
    message: `Nuevo botón: "${button.text}"`,
    relatedId: button.id,
    data: { buttonText: button.text, category: button.category }
  }, creatorId);
};

/**
 * Crear notificación de perfil creado
 */
export const notifyProfileCreated = async (organizationId, profile, creatorId) => {
  return notifyOrganizationMembers(organizationId, {
    type: NOTIFICATION_TYPES.PROFILE_CREATED,
    message: `Nuevo perfil: "${profile.name}"`,
    relatedId: profile.id,
    data: { profileName: profile.name }
  }, creatorId);
};

/**
 * Crear notificación de usuario se unió
 */
export const notifyUserJoined = async (organizationId, user) => {
  return notifyOrganizationMembers(organizationId, {
    type: NOTIFICATION_TYPES.USER_JOINED,
    message: `${user.displayName} se unió a la organización`,
    relatedId: user.uid,
    data: { userName: user.displayName, userEmail: user.email }
  }, user.uid);
};
