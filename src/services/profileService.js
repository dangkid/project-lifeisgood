import { db } from '../config/firebase';
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

const PROFILES_COLLECTION = 'patient_profiles';

// Crear un nuevo perfil de paciente
export const createProfile = async (profileData) => {
  const docRef = await addDoc(collection(db, PROFILES_COLLECTION), {
    name: profileData.name,
    photo_url: profileData.photo_url || '',
    description: profileData.description || '',
    tags: profileData.tags || [],
    created_at: serverTimestamp(),
    stats: {
      total_phrases: 0,
      total_button_clicks: 0,
      most_used_buttons: {},
      last_active: serverTimestamp()
    }
  });
  return docRef.id;
};

// Obtener todos los perfiles
export const getProfiles = async () => {
  const q = query(collection(db, PROFILES_COLLECTION), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Obtener un perfil específico
export const getProfile = async (profileId) => {
  const docRef = doc(db, PROFILES_COLLECTION, profileId);
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
  const docRef = doc(db, PROFILES_COLLECTION, profileId);
  await updateDoc(docRef, updates);
};

// Eliminar perfil
export const deleteProfile = async (profileId) => {
  await deleteDoc(doc(db, PROFILES_COLLECTION, profileId));
};

// Registrar uso de botón (para estadísticas)
export const recordButtonClick = async (profileId, buttonId, buttonText) => {
  if (!profileId) return;
  
  const docRef = doc(db, PROFILES_COLLECTION, profileId);
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
  
  const docRef = doc(db, PROFILES_COLLECTION, profileId);
  
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
