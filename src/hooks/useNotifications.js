/**
 * Hook para Notificaciones
 * Maneja suscripción y estado de notificaciones
 */

import { useState, useEffect } from 'react';
import { 
  subscribeToNotifications, 
  markAsRead, 
  deleteNotification,
  getUnreadCount,
  markAllAsRead
} from '../services/notificationService';
import { auth } from '../config/firebase';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = auth.currentUser;

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Suscribirse a cambios en tiempo real
      const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
        setNotifications(notifs);
        
        // Contar no leídas
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
        
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error en hook de notificaciones:', err);
      setError(err);
      setLoading(false);
    }
  }, [user]);

  // Marcar como leída
  const handleMarkAsRead = async (notificationId) => {
    if (!user) return;

    try {
      await markAsRead(user.uid, notificationId);
      // La UI se actualiza automáticamente por la suscripción
    } catch (err) {
      console.error('Error marcando como leída:', err);
      setError(err);
    }
  };

  // Eliminar notificación
  const handleDelete = async (notificationId) => {
    if (!user) return;

    try {
      await deleteNotification(user.uid, notificationId);
      // La UI se actualiza automáticamente por la suscripción
    } catch (err) {
      console.error('Error eliminando:', err);
      setError(err);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllAsRead(user.uid);
      // La UI se actualiza automáticamente por la suscripción
    } catch (err) {
      console.error('Error marcando todas:', err);
      setError(err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead: handleMarkAsRead,
    deleteNotification: handleDelete,
    markAllAsRead: handleMarkAllAsRead
  };
};
