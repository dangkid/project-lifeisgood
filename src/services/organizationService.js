import { db } from '../config/firebase';
import { doc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { getCurrentUserData } from './authService';

// Obtener información de la organización actual del usuario
export const getCurrentOrganization = async () => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    return null;
  }
  
  const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
  if (orgDoc.exists()) {
    return {
      id: orgDoc.id,
      ...orgDoc.data()
    };
  }
  return null;
};

// Obtener todos los miembros de la organización
export const getOrganizationMembers = async (organizationId = null) => {
  const userData = await getCurrentUserData();
  const targetOrgId = organizationId || userData?.organizationId;
  if (!targetOrgId) {
    return [];
  }
  
  const membersSnapshot = await getDocs(
    collection(db, 'organizations', targetOrgId, 'members')
  );
  
  return membersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Actualizar rol de un miembro
export const updateMemberRole = async (userId, newRole) => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    throw new Error('Usuario no autenticado o sin organización');
  }
  
  // Solo admins pueden cambiar roles
  if (userData.role !== 'admin') {
    throw new Error('No tienes permisos para cambiar roles');
  }
  
  const memberRef = doc(db, 'organizations', userData.organizationId, 'members', userId);
  await updateDoc(memberRef, {
    role: newRole
  });
};

// Obtener ID de la organización para compartir
export const getOrganizationInviteCode = async () => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    return null;
  }
  
  return userData.organizationId;
};
