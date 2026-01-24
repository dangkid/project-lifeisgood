import { db, auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { getCurrentUserData } from './authService';

// Crear un nuevo perfil de paciente (bajo la organización del usuario)
export const createProfile = async (profileData) => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    throw new Error('Usuario no autenticado o sin organización');
  }
  
  const docRef = await addDoc(collection(db, 'organizations', userData.organizationId, 'profiles'), {
    name: profileData.name,
    photo_url: profileData.photo_url || '',
    description: profileData.description || '',
    tags: profileData.tags || [],
    created_at: serverTimestamp(),
    created_by: userData.uid,
    stats: {
      total_phrases: 0,
      total_button_clicks: 0,
      most_used_buttons: {},
      last_active: serverTimestamp()
    }
  });
  return docRef.id;
};

// Obtener todos los perfiles de la organización
export const getProfiles = async () => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    return [];
  }
  
  const q = query(
    collection(db, 'organizations', userData.organizationId, 'profiles'), 
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Obtener un perfil específico
export const getProfile = async (profileId) => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    return null;
  }
  
  const docRef = doc(db, 'organizations', userData.organizationId, 'profiles', profileId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  return null;
};

// Actualizar perfil
export const updateProfile = async (profileId, updates) => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    throw new Error('Usuario no autenticado o sin organización');
  }
  
  const docRef = doc(db, 'organizations', userData.organizationId, 'profiles', profileId);
  await updateDoc(docRef, updates);
};

// Eliminar perfil
export const deleteProfile = async (profileId) => {
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) {
    throw new Error('Usuario no autenticado o sin organización');
  }
  
  await deleteDoc(doc(db, 'organizations', userData.organizationId, 'profiles', profileId));
};

// Registrar uso de botón (para estadísticas)
export const recordButtonClick = async (profileId, buttonId, buttonText) => {
  if (!profileId) return;
  
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) return;
  
  const docRef = doc(db, 'organizations', userData.organizationId, 'profiles', profileId);
  const profile = await getDoc(docRef);
  
  if (profile.exists()) {
    const currentStats = profile.data().stats || {};
    const mostUsed = currentStats.most_used_buttons || {};
    
    await updateDoc(docRef, {
      'stats.total_button_clicks': increment(1),
      'stats.last_active': serverTimestamp(),
      [`stats.most_used_buttons.${buttonId}`]: {
        text: buttonText,
        count: (mostUsed[buttonId]?.count || 0) + 1
      }
    });
  }
};

// Registrar frase construida (para estadísticas)
export const recordPhraseCreated = async (profileId, phrase) => {
  if (!profileId) return;
  
  const userData = await getCurrentUserData();
  if (!userData || !userData.organizationId) return;
  
  const docRef = doc(db, 'organizations', userData.organizationId, 'profiles', profileId);
  
  await updateDoc(docRef, {
    'stats.total_phrases': increment(1),
    'stats.last_active': serverTimestamp()
  });
};

// Obtener estadísticas del perfil
export const getProfileStats = async (profileId) => {
  const profile = await getProfile(profileId);
  if (!profile) return null;
  
  const stats = profile.stats || {};
  
  // Convertir most_used_buttons a array y ordenar
  const mostUsedArray = Object.entries(stats.most_used_buttons || {})
    .map(([id, data]) => ({
      id,
      text: data.text,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
  
  return {
    total_phrases: stats.total_phrases || 0,
    total_button_clicks: stats.total_button_clicks || 0,
    most_used_buttons: mostUsedArray,
    last_active: stats.last_active
  };
};
