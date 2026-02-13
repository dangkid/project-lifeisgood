import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, updateDoc } from 'firebase/firestore';

// Registrar nuevo usuario (sin organización aún)
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Usuario creado en Firebase Auth:', user.uid);
    
    // Actualizar perfil con nombre
    await updateProfile(user, { displayName });
    
    console.log('Perfil actualizado con displayName');
    
    // Enviar email de verificación (NO BLOQUEAR si falla)
    console.log('Intentando enviar email de verificación...');
    try {
      await sendEmailVerification(user);
      console.log('✅ Email de verificación enviado exitosamente a:', email);
    } catch (emailError) {
      console.warn('⚠️  Email de verificación no se pudo enviar:', emailError);
      // Continuar de todas formas, el usuario puede verificar después
    }
    
    // Crear documento de usuario en Firestore con rol por defecto 'usuario'
    // Esto permite que el usuario pueda crear organizaciones más tarde
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      createdAt: serverTimestamp(),
      emailVerified: false,
      role: 'usuario' // Rol por defecto para usuarios sin organización
    });
    
    console.log('Documento de usuario creado en Firestore');
    
    return user;
  } catch (error) {
    console.error('❌ Error en registro:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje de error:', error.message);
    throw error;
  }
};

// Reenviar email de verificación
export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  
  try {
    console.log('Reenviando email de verificación a:', user.email);
    await sendEmailVerification(user);
    console.log('✅ Email de verificación reenviado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error reenviando email:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
    throw error;
  }
};

// Crear nueva organización para el usuario actual
export const createOrganization = async (organizationName) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  
  try {
    console.log('Creando organización:', organizationName);
    console.log('Usuario:', user.uid);
    
    // 1. Crear organización primero
    const orgRef = await addDoc(collection(db, 'organizations'), {
      name: organizationName,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      memberCount: 1
    });
    
    console.log('Organización creada con ID:', orgRef.id);
    
    // 2. Agregar usuario como admin de la organización (esto debe funcionar con las nuevas reglas)
    await setDoc(doc(db, 'organizations', orgRef.id, 'members', user.uid), {
      email: user.email,
      displayName: user.displayName || user.email,
      role: 'admin',
      joinedAt: serverTimestamp()
    });
    
    console.log('Usuario agregado como admin de la organización');
    
    // 3. Actualizar documento de usuario con organizationId y rol
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log('Documento de usuario no existe, creándolo...');
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email,
        organizationId: orgRef.id,
        role: 'admin',
        createdAt: serverTimestamp(),
        emailVerified: user.emailVerified || false
      });
    } else {
      console.log('Actualizando documento de usuario existente...');
      await updateDoc(userRef, {
        organizationId: orgRef.id,
        role: 'admin'
      });
    }
    
    console.log('Organización creada exitosamente');
    return orgRef.id;
  } catch (error) {
    console.error('❌ Error creando organización:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje de error:', error.message);
    
    // Proporcionar mensajes más específicos para problemas comunes
    if (error.code === 'permission-denied') {
      throw new Error('Permiso denegado. Verifica que las reglas de Firestore permitan crear organizaciones.');
    }
    
    throw error;
  }
};

// Unirse a organización existente
export const joinOrganization = async (organizationId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  
  try {
    console.log('Intentando unirse a organización:', organizationId);
    console.log('Usuario actual:', user.uid);
    
    // Verificar que la organización existe
    const orgRef = doc(db, 'organizations', organizationId);
    const orgSnap = await getDoc(orgRef);
    
    console.log('Organización existe:', orgSnap.exists());
    
    if (!orgSnap.exists()) {
      throw new Error('Organización no encontrada. Verifica el código e intenta nuevamente.');
    }
    
    console.log('Agregando usuario como miembro...');
    
    // Agregar usuario como miembro
    await setDoc(doc(db, 'organizations', organizationId, 'members', user.uid), {
      email: user.email,
      displayName: user.displayName || user.email,
      role: 'miembro',
      joinedAt: serverTimestamp()
    });
    
    console.log('Usuario agregado como miembro');
    
    // Incrementar contador de miembros
    await updateDoc(orgRef, {
      memberCount: (orgSnap.data().memberCount || 0) + 1
    });
    
    console.log('Contador actualizado');
    
    // Verificar si el documento de usuario existe, si no, crearlo
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log('Documento de usuario no existe, creándolo...');
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email,
        organizationId: organizationId,
        role: 'miembro',
        createdAt: serverTimestamp()
      });
    } else {
      console.log('Actualizando documento de usuario existente...');
      await updateDoc(userRef, {
        organizationId: organizationId,
        role: 'miembro'
      });
    }
    
    console.log('Usuario actualizado con organizationId');
    
    return organizationId;
  } catch (error) {
    console.error('Error uniéndose a organización:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener datos del usuario actual
export const getCurrentUserData = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return {
      uid: user.uid,
      ...userDoc.data()
    };
  }
  return null;
};

// Verificar si el usuario actual es administrador
export const isUserAdmin = async () => {
  const userData = await getCurrentUserData();
  return userData?.role === 'admin';
};

// Obtener el rol del usuario actual
export const getUserRole = async () => {
  const userData = await getCurrentUserData();
  return userData?.role || 'user'; // Por defecto 'user' si no tiene rol definido
};

// Verificar si el usuario tiene un rol específico
export const hasUserRole = async (role) => {
  const userData = await getCurrentUserData();
  return userData?.role === role;
};

// Verificar si el usuario puede crear/editar/borrar botones
export const canManageButtons = async () => {
  const userData = await getCurrentUserData();
  return userData?.role === 'admin' || userData?.role === 'especialista';
};

// Verificar si el usuario puede invitar miembros
export const canInviteMembers = async () => {
  const userData = await getCurrentUserData();
  return userData?.role === 'admin' || userData?.role === 'especialista';
};

// Obtener las acciones permitidas para el usuario
export const getUserPermissions = async () => {
  const userData = await getCurrentUserData();
  const role = userData?.role || 'miembro';
  
  const permissionsByRole = {
    admin: {
      canCreateButtons: true,
      canEditButtons: true,
      canDeleteButtons: true,
      canInviteMembers: true,
      canManageRoles: true,
      canManageProfiles: true,
      canViewAnalytics: true,
      label: 'Administrador'
    },
    especialista: {
      canCreateButtons: true,
      canEditButtons: true,
      canDeleteButtons: true,
      canInviteMembers: true,
      canManageRoles: false,
      canManageProfiles: false,
      canViewAnalytics: true,
      label: 'Especialista'
    },
    miembro: {
      canCreateButtons: false,
      canEditButtons: false,
      canDeleteButtons: false,
      canInviteMembers: false,
      canManageRoles: false,
      canManageProfiles: false,
      canViewAnalytics: false,
      label: 'Miembro'
    }
  };
  
  return permissionsByRole[role] || permissionsByRole['miembro'];
};

// Verificar si el usuario es terapeuta
export const isUserTherapist = async () => {
  const userData = await getCurrentUserData();
  return userData?.role === 'therapist';
};

// Verificar si el usuario es usuario normal
export const isUserNormal = async () => {
  const userData = await getCurrentUserData();
  return userData?.role === 'user' || !userData?.role; // Por defecto 'user'
};

// Obtener datos completos del usuario con rol
export const getCurrentUserWithRole = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      ...userDoc.data()
    };
  }
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    role: null
  };
};
