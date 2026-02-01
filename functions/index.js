/**
 * Cloud Functions for Comunicacentros
 * - Automatic notifications on button creation/update
 * - Audit logging for all document changes
 * - User authorization triggers
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ==========================================
// FUNCIÓN 1: Notificaciones en tiempo real
// ==========================================

/**
 * Trigger: onCreate, onUpdate para /organizations/{orgId}/buttons
 * Acción: Envía notificación a miembros de la organización
 * Propósito: Notificar cuando se crean o actualizan botones
 */
exports.notifyOnButtonChange = functions.firestore
  .document('organizations/{orgId}/buttons/{buttonId}')
  .onWrite(async (change, context) => {
    const { orgId } = context.params;
    const newData = change.after.exists ? change.after.data() : null;
    const oldData = change.before.exists ? change.before.data() : null;
    
    // Determinar si es creación o actualización
    const isCreate = !oldData && newData;
    const isUpdate = oldData && newData;
    
    if (!newData) return null; // Deletion, skip notification
    
    try {
      // Obtener miembros de la organización
      const membersSnapshot = await db
        .collection('organizations')
        .doc(orgId)
        .collection('members')
        .where('role', 'in', ['admin', 'especialista'])
        .get();
      
      const notificationTitle = isCreate 
        ? `Nuevo Botón: ${newData.text}`
        : `Botón Actualizado: ${newData.text}`;
      
      const notificationBody = isCreate
        ? `Se ha creado un nuevo botón de comunicación`
        : `El botón ha sido actualizado`;
      
      // Crear notificación para cada miembro
      for (const memberDoc of membersSnapshot.docs) {
        const member = memberDoc.data();
        const userId = memberDoc.id;
        
        // Guardar notificación en Firestore
        await db
          .collection('users')
          .doc(userId)
          .collection('notifications')
          .add({
            type: 'button_change',
            title: notificationTitle,
            body: notificationBody,
            organizationId: orgId,
            buttonId: context.params.buttonId,
            action: isCreate ? 'created' : 'updated',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            icon: newData.image || 'https://via.placeholder.com/64'
          });
      }
      
      console.log(`Notification sent for button ${context.params.buttonId} in org ${orgId}`);
      return null;
    } catch (error) {
      console.error('Error sending button notification:', error);
      throw error;
    }
  });

// ==========================================
// FUNCIÓN 2: Auditoría automática
// ==========================================

/**
 * Trigger: onWrite para documentos en organizaciones
 * Acción: Registra cambios en el log de auditoría
 * Propósito: Mantener un registro de todas las modificaciones
 */
exports.auditOnChange = functions.firestore
  .document('organizations/{orgId}/{docType}/{docId}')
  .onWrite(async (change, context) => {
    const { orgId, docType, docId } = context.params;
    const newData = change.after.exists ? change.after.data() : null;
    const oldData = change.before.exists ? change.before.data() : null;
    
    // Determinar tipo de acción
    let action = 'unknown';
    if (!oldData && newData) action = 'create';
    else if (oldData && !newData) action = 'delete';
    else if (oldData && newData) action = 'update';
    
    // Saltar ciertas colecciones para evitar loops infinitos
    if (['auditLog', 'notifications'].includes(docType)) return null;
    
    try {
      // Crear registro de auditoría
      await db
        .collection('organizations')
        .doc(orgId)
        .collection('auditLog')
        .add({
          action,
          docType,
          docId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          changes: {
            before: oldData || null,
            after: newData || null,
            changedFields: getChangedFields(oldData, newData)
          },
          userId: change.after.get('modifiedBy') || 'system',
          ipAddress: context.request?.ip || 'unknown'
        });
      
      console.log(`Audit logged: ${action} ${docType}/${docId}`);
      return null;
    } catch (error) {
      console.error('Error logging audit:', error);
      throw error;
    }
  });

// ==========================================
// FUNCIÓN 3: Notificaciones de invitación
// ==========================================

/**
 * Trigger: onCreate para /organizations/{orgId}/invitations
 * Acción: Envía notificación de invitación a miembro nuevo
 * Propósito: Notificar cuando se invita a un nuevo miembro
 */
exports.notifyOnInvitation = functions.firestore
  .document('organizations/{orgId}/invitations/{invitationId}')
  .onCreate(async (snap, context) => {
    const { orgId } = context.params;
    const invitation = snap.data();
    
    try {
      // Obtener datos de la organización
      const orgDoc = await db.collection('organizations').doc(orgId).get();
      const orgName = orgDoc.data().name;
      
      // Crear notificación
      await db
        .collection('users')
        .doc(invitation.userId)
        .collection('notifications')
        .add({
          type: 'invitation',
          title: `Invitación de ${orgName}`,
          body: `Has sido invitado a ${orgName}`,
          organizationId: orgId,
          invitationId: context.params.invitationId,
          action: 'invited',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      
      console.log(`Invitation notification sent to user ${invitation.userId}`);
      return null;
    } catch (error) {
      console.error('Error sending invitation notification:', error);
      throw error;
    }
  });

// ==========================================
// FUNCIÓN 4: Notificación de rol otorgado
// ==========================================

/**
 * Trigger: onUpdate para /organizations/{orgId}/members/{memberId}
 * Acción: Notifica cambios de rol a miembros
 * Propósito: Alertar sobre promociones/cambios de acceso
 */
exports.notifyOnRoleChange = functions.firestore
  .document('organizations/{orgId}/members/{memberId}')
  .onUpdate(async (change, context) => {
    const { orgId, memberId } = context.params;
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // Solo procesar si cambió el rol
    if (oldData.role === newData.role) return null;
    
    try {
      const roleLabels = {
        'admin': 'Administrador',
        'especialista': 'Especialista',
        'terapeuta': 'Terapeuta',
        'miembro': 'Miembro'
      };
      
      // Crear notificación
      await db
        .collection('users')
        .doc(memberId)
        .collection('notifications')
        .add({
          type: 'role_change',
          title: 'Cambio de Rol',
          body: `Tu rol ha sido cambiado a ${roleLabels[newData.role]}`,
          organizationId: orgId,
          newRole: newData.role,
          oldRole: oldData.role,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      
      console.log(`Role change notification sent to user ${memberId}`);
      return null;
    } catch (error) {
      console.error('Error sending role change notification:', error);
      throw error;
    }
  });

// ==========================================
// FUNCIÓN 5: Limpieza automática
// ==========================================

/**
 * Trigger: Scheduled daily
 * Acción: Limpia notificaciones antiguas y registros obsoletos
 * Propósito: Mantener la base de datos limpia y optimizada
 */
exports.cleanupOldData = functions.pubsub
  .schedule('every day 02:00')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Obtener todas las organizaciones
      const orgsSnapshot = await db.collection('organizations').get();
      
      for (const orgDoc of orgsSnapshot.docs) {
        const orgId = orgDoc.id;
        
        // Limpiar notificaciones leídas antiguas
        const oldNotifications = await db
          .collectionGroup('notifications')
          .where('organizationId', '==', orgId)
          .where('read', '==', true)
          .where('timestamp', '<', thirtyDaysAgo)
          .get();
        
        for (const notifDoc of oldNotifications.docs) {
          await notifDoc.ref.delete();
        }
      }
      
      console.log('Cleanup completed successfully');
      return null;
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  });

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Compara dos objetos y retorna los campos que cambiaron
 */
function getChangedFields(oldData, newData) {
  if (!oldData) return Object.keys(newData || {});
  if (!newData) return Object.keys(oldData || {});
  
  const changed = [];
  const allKeys = new Set([
    ...Object.keys(oldData),
    ...Object.keys(newData)
  ]);
  
  for (const key of allKeys) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changed.push(key);
    }
  }
  
  return changed;
}
