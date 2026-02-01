/**
 * Servicio de Auditoría
 * Seguimiento de cambios en documentos (crear, actualizar, eliminar)
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

/**
 * Tipos de acciones auditadas
 */
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  READ: 'read',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ROLE_CHANGE: 'role_change',
  PERMISSION_DENIED: 'permission_denied'
};

/**
 * Registrar una acción en el log de auditoría
 */
export async function logAuditAction({
  organizationId,
  userId,
  action,
  documentType, // 'button', 'profile', 'user', 'organization', etc
  documentId,
  changes = {}, // Cambios realizados {field: {before, after}}
  metadata = {}
}) {
  try {
    if (!organizationId || !userId || !action) {
      throw new Error('Parámetros requeridos: organizationId, userId, action');
    }

    const auditEntry = {
      organizationId,
      userId,
      action,
      documentType,
      documentId,
      changes,
      metadata,
      timestamp: Timestamp.now(),
      createdAt: new Date()
    };

    // Guardar en subcollección de auditoría de la organización
    const docRef = await addDoc(
      collection(firestore, `organizations/${organizationId}/auditLog`),
      auditEntry
    );

    return {
      id: docRef.id,
      ...auditEntry
    };
  } catch (error) {
    console.error('Error logging audit action:', error);
    throw error;
  }
}

/**
 * Obtener logs de auditoría con filtros
 */
export async function getAuditLogs(organizationId, {
  userId = null,
  action = null,
  documentType = null,
  startDate = null,
  endDate = null,
  limit: resultLimit = 50
} = {}) {
  try {
    if (!organizationId) throw new Error('Organization ID requerido');

    const conditions = [
      where('organizationId', '==', organizationId)
    ];

    if (userId) {
      conditions.push(where('userId', '==', userId));
    }

    if (action) {
      conditions.push(where('action', '==', action));
    }

    if (documentType) {
      conditions.push(where('documentType', '==', documentType));
    }

    if (startDate) {
      conditions.push(where('timestamp', '>=', startDate));
    }

    if (endDate) {
      conditions.push(where('timestamp', '<=', endDate));
    }

    conditions.push(
      orderBy('timestamp', 'desc'),
      limit(resultLimit)
    );

    const q = query(collection(firestore, `organizations/${organizationId}/auditLog`), ...conditions);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      createdAt: doc.data().createdAt || new Date()
    }));
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }
}

/**
 * Obtener logs en tiempo real
 */
export function subscribeToAuditLogs(organizationId, callback, {
  userId = null,
  limit: resultLimit = 50
} = {}) {
  try {
    if (!organizationId) throw new Error('Organization ID requerido');

    const conditions = [
      where('organizationId', '==', organizationId),
      orderBy('timestamp', 'desc'),
      limit(resultLimit)
    ];

    if (userId) {
      conditions.push(where('userId', '==', userId));
    }

    const q = query(collection(firestore, `organizations/${organizationId}/auditLog`), ...conditions);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt || new Date()
      }));
      callback(logs);
    }, (error) => {
      console.error('Error in audit log subscription:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to audit logs:', error);
    throw error;
  }
}

/**
 * Obtener resumen de actividades por usuario
 */
export async function getUserActivitySummary(organizationId, userId) {
  try {
    if (!organizationId || !userId) throw new Error('Organization ID y User ID requeridos');

    const q = query(
      collection(firestore, `organizations/${organizationId}/auditLog`),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date()
    }));

    // Agrupar por acción
    const actionCounts = {};
    const documentChanges = {};
    let lastActivity = null;

    logs.forEach(log => {
      // Contar acciones
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

      // Rastrear cambios por tipo de documento
      if (log.documentType) {
        if (!documentChanges[log.documentType]) {
          documentChanges[log.documentType] = {
            creates: 0,
            updates: 0,
            deletes: 0
          };
        }
        documentChanges[log.documentType][log.action + 's']++;
      }

      // Última actividad
      if (!lastActivity) {
        lastActivity = log.timestamp;
      }
    });

    return {
      userId,
      totalActions: logs.length,
      lastActivity,
      actionCounts,
      documentChanges,
      recentLogs: logs.slice(0, 10)
    };
  } catch (error) {
    console.error('Error getting user activity summary:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de auditoría
 */
export async function getAuditStatistics(organizationId, {
  days = 30
} = {}) {
  try {
    if (!organizationId) throw new Error('Organization ID requerido');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(firestore, `organizations/${organizationId}/auditLog`),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => doc.data());

    // Calcular estadísticas
    const stats = {
      totalActions: logs.length,
      actionsByType: {},
      actionsByDocument: {},
      topUsers: {},
      activityByDay: {},
      period: `Últimos ${days} días`
    };

    logs.forEach(log => {
      // Por tipo de acción
      stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;

      // Por tipo de documento
      if (log.documentType) {
        stats.actionsByDocument[log.documentType] = (stats.actionsByDocument[log.documentType] || 0) + 1;
      }

      // Top usuarios
      if (log.userId) {
        stats.topUsers[log.userId] = (stats.topUsers[log.userId] || 0) + 1;
      }

      // Por día
      const date = log.timestamp?.toDate?.() || log.createdAt;
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        stats.activityByDay[dateStr] = (stats.activityByDay[dateStr] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting audit statistics:', error);
    throw error;
  }
}

/**
 * Exportar logs de auditoría como CSV
 */
export async function exportAuditLogsAsCSV(organizationId, filters = {}) {
  try {
    const logs = await getAuditLogs(organizationId, { ...filters, limit: 1000 });

    // Crear CSV
    const headers = ['Timestamp', 'Usuario', 'Acción', 'Documento', 'ID Documento', 'Detalles'];
    const rows = logs.map(log => [
      log.timestamp?.toLocaleString('es-ES') || '',
      log.userId || '',
      log.action || '',
      log.documentType || '',
      log.documentId || '',
      JSON.stringify(log.changes || {})
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
}

/**
 * Detectar cambios en un objeto
 * Retorna solo los campos que cambiaron
 */
export function detectChanges(beforeObject, afterObject) {
  const changes = {};

  // Obtener todas las claves
  const allKeys = new Set([
    ...Object.keys(beforeObject || {}),
    ...Object.keys(afterObject || {})
  ]);

  allKeys.forEach(key => {
    const before = beforeObject?.[key];
    const after = afterObject?.[key];

    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changes[key] = {
        before: before !== undefined ? before : 'N/A',
        after: after !== undefined ? after : 'N/A'
      };
    }
  });

  return changes;
}
