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
// FUNCIÓN 3: Asignar organizationId
// ==========================================

/**
 * Callable: assignOrganizationToUser
 * Parámetros: { organizationId }
 * Acción: Asigna una organización al usuario actual (con permisos elevados)
 * Propósito: Evitar problemas de seguridad al asignar organizationId desde cliente
 */
exports.assignOrganizationToUser = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuario no autenticado'
    );
  }

  const { organizationId } = data;
  const userId = context.auth.uid;

  if (!organizationId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'organizationId es requerido'
    );
  }

  try {
    // Verificar que la organización existe
    const orgDoc = await db.collection('organizations').doc(organizationId).get();
    if (!orgDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Organización no encontrada'
      );
    }

    // Verificar que el usuario es miembro de la organización
    const memberDoc = await db
      .collection('organizations')
      .doc(organizationId)
      .collection('members')
      .doc(userId)
      .get();

    if (!memberDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No eres miembro de esta organización'
      );
    }

    // Asignar organizationId al usuario (con permisos elevados)
    await db.collection('users').doc(userId).update({
      organizationId: organizationId
    });

    console.log(`Organization ${organizationId} assigned to user ${userId}`);
    
    return {
      success: true,
      message: 'Organización asignada correctamente',
      organizationId: organizationId
    };
  } catch (error) {
    console.error('Error asignando organización:', error);
    
    if (error.code && error.code.startsWith('permission')) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Error al asignar organización: ' + error.message
    );
  }
});

// ==========================================
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
// ==========================================
// FUNCIÓN: Cambiar rol de usuario (SEGURA)
// ==========================================
/**
 * Callable Function: setUserRole
 * 
 * Parámetros:
 * - organizationId: ID de la organización
 * - userId: ID del usuario a cambiar de rol
 * - newRole: Nuevo rol ('admin', 'especialista', 'miembro')
 * 
 * Validaciones:
 * - Solo admins pueden cambiar roles
 * - No pueden quitarse el rol de admin a sí mismos (si es único)
 * - El nuevo rol debe ser válido
 * 
 * Retorna: { success: true, message: '...' }
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // 1️⃣ Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes estar autenticado para cambiar roles'
    );
  }

  const { organizationId, userId, newRole } = data;

  // 2️⃣ Validar parámetros
  if (!organizationId || !userId || !newRole) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Parámetros requeridos: organizationId, userId, newRole'
    );
  }

  if (!['admin', 'especialista', 'miembro'].includes(newRole)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Rol inválido. Debe ser: admin, especialista o miembro'
    );
  }

  try {
    const adminUid = context.auth.uid;
    const orgRef = db.collection('organizations').doc(organizationId);
    const membersRef = orgRef.collection('members');

    // 3️⃣ Verificar que el usuario que hace la solicitud es admin
    const adminDoc = await membersRef.doc(adminUid).get();

    if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo administradores pueden cambiar roles. Contacta con el administrador de tu organización.'
      );
    }

    // 4️⃣ Verificar que el usuario existe
    const userDoc = await membersRef.doc(userId).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'El usuario no existe en esta organización'
      );
    }

    // 5️⃣ Prevenir que un admin se quite el rol (si es el único)
    if (newRole !== 'admin' && userDoc.data().role === 'admin') {
      const adminCount = await membersRef
        .where('role', '==', 'admin')
        .get();

      if (adminCount.size === 1) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No puedes cambiar el rol del único administrador de la organización. Designa otro admin primero.'
        );
      }
    }

    // 6️⃣ Actualizar rol en members
    await membersRef.doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: adminUid
    });

    // 7️⃣ Actualizar en users (para sincronización global)
    await db.collection('users').doc(userId).update({
      role: newRole,
      organizationId: organizationId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 8️⃣ Registrar en auditoría
    await orgRef.collection('auditLog').add({
      action: 'role_change',
      userId: adminUid,
      targetUserId: userId,
      oldRole: userDoc.data().role,
      newRole: newRole,
      organizationId: organizationId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        changedBy: adminUid,
        reason: 'Cambio de rol administrativo'
      }
    });

    // 9️⃣ Crear notificación para el usuario
    const userRef = db.collection('users').doc(userId);
    await userRef.collection('notifications').add({
      type: 'role_changed',
      title: 'Tu rol ha sido actualizado',
      message: `Tu rol en la organización ha sido cambiado a: ${newRole}`,
      organizationId: organizationId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      actionUrl: '/admin'
    });

    return {
      success: true,
      message: `Rol de usuario actualizado a: ${newRole}`,
      userId: userId,
      organizationId: organizationId,
      newRole: newRole
    };

  } catch (error) {
    console.error('Error en setUserRole:', error);

    if (error.code && error.code.includes('permission-denied')) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Error al cambiar rol de usuario: ' + error.message
    );
  }
});