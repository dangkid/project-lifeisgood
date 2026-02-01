/**
 * Centro de Notificaciones
 * Componente para mostrar y gestionar notificaciones
 */

import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead, 
    deleteNotification, 
    markAllAsRead 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Agrupar notificaciones por tipo
  const groupedByType = notifications.reduce((acc, notif) => {
    const type = notif.type || 'system_message';
    if (!acc[type]) acc[type] = [];
    acc[type].push(notif);
    return acc;
  }, {});

  // Obtener icono según tipo
  const getTypeIcon = (type) => {
    const icons = {
      'button_created': '🔘',
      'button_updated': '✏️',
      'button_deleted': '🗑️',
      'profile_created': '👤',
      'profile_updated': '👤',
      'profile_deleted': '👤',
      'user_joined': '➕',
      'user_role_changed': '👑',
      'org_created': '🏢',
      'org_updated': '🏢',
      'system_message': 'ℹ️'
    };
    return icons[type] || '📢';
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return date.toLocaleDateString('es-ES');
  };

  return (
    <>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        title="Notificaciones"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Notificaciones</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-800 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-100 mt-1">{unreadCount} no leídas</p>
            )}
          </div>

          {/* Contenido */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">Error cargando notificaciones</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay notificaciones</p>
              </div>
            ) : (
              <>
                {/* Botón marcar todo como leído */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 flex items-center gap-1"
                  >
                    <CheckCheck size={16} />
                    Marcar todo como leído
                  </button>
                )}

                {/* Lista de notificaciones */}
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        notif.read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono */}
                        <span className="text-xl flex-shrink-0">
                          {getTypeIcon(notif.type)}
                        </span>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(notif.createdAt)}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 flex-shrink-0">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="p-1 hover:bg-blue-200 rounded transition-colors"
                              title="Marcar como leída"
                            >
                              <Check size={16} className="text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="p-1 hover:bg-red-200 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
