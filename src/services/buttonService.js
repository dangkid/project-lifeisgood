import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { getCurrentUserData } from './authService';

// Botones por defecto (sin usuario logueado)
const getDefaultButtons = () => {
  const hour = new Date().getHours();
  let timeContext = 'always';
  
  if (hour >= 8 && hour < 14) timeContext = 'morning';
  else if (hour >= 14 && hour < 20) timeContext = 'afternoon';
  else timeContext = 'night';
  
  const defaultButtons = [
    // Necesidades básicas (siempre visibles)
    {
      id: 'default-1',
      text: 'Tengo sed',
      image_url: 'https://api.arasaac.org/api/pictograms/2418',
      type: 'communication',
      category: 'necesidades',
      time_context: ['always'],
      priority: 1,
      voice_gender: 'female'
    },
    {
      id: 'default-2',
      text: 'Necesito ir al baño',
      image_url: 'https://api.arasaac.org/api/pictograms/4258',
      type: 'communication',
      category: 'necesidades',
      time_context: ['always'],
      priority: 2,
      voice_gender: 'female'
    },
    {
      id: 'default-3',
      text: 'Tengo hambre',
      image_url: 'https://api.arasaac.org/api/pictograms/2419',
      type: 'communication',
      category: 'necesidades',
      time_context: ['always'],
      priority: 3,
      voice_gender: 'female'
    },
    // Emociones
    {
      id: 'default-4',
      text: 'Estoy feliz',
      image_url: 'https://api.arasaac.org/api/pictograms/8793',
      type: 'communication',
      category: 'emociones',
      time_context: ['always'],
      priority: 4,
      voice_gender: 'female'
    },
    {
      id: 'default-5',
      text: 'Estoy cansado',
      image_url: 'https://api.arasaac.org/api/pictograms/8798',
      type: 'communication',
      category: 'emociones',
      time_context: ['always'],
      priority: 5,
      voice_gender: 'female'
    },
    // Saludos según hora del día
    {
      id: 'default-morning',
      text: 'Buenos días',
      image_url: 'https://api.arasaac.org/api/pictograms/8230',
      type: 'communication',
      category: 'saludos',
      time_context: ['morning'],
      priority: 0,
      voice_gender: 'female'
    },
    {
      id: 'default-afternoon',
      text: 'Buenas tardes',
      image_url: 'https://api.arasaac.org/api/pictograms/8231',
      type: 'communication',
      category: 'saludos',
      time_context: ['afternoon'],
      priority: 0,
      voice_gender: 'female'
    },
    {
      id: 'default-night',
      text: 'Buenas noches',
      image_url: 'https://api.arasaac.org/api/pictograms/8232',
      type: 'communication',
      category: 'saludos',
      time_context: ['night'],
      priority: 0,
      voice_gender: 'female'
    }
  ];
  
  // Filtrar según contexto de tiempo
  return defaultButtons.filter(btn => 
    btn.time_context.includes('always') || btn.time_context.includes(timeContext)
  );
};

// Get all buttons (optionally filtered by profile)
export const getButtons = async (profileId = null) => {
  try {
    const userData = await getCurrentUserData();
    
    // Si no hay usuario logueado, devolver botones globales por defecto
    if (!userData || !userData.organizationId) {
      return getDefaultButtons();
    }
    
    // Obtener botones de la organización
    const q = query(
      collection(db, 'organizations', userData.organizationId, 'buttons'), 
      orderBy('priority', 'asc')
    );
    const snapshot = await getDocs(q);
    const allButtons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Si no se especifica perfil, devolver todos
    if (!profileId) {
      return allButtons;
    }
    
    // Filtrar: botones globales + botones específicos del perfil
    return allButtons.filter(btn => 
      !btn.profileId || btn.profileId === 'global' || btn.profileId === profileId
    );
  } catch (error) {
    console.error('Error fetching buttons:', error);
    return getDefaultButtons(); // Fallback a botones por defecto
  }
};

// Create a new button
export const createButton = async (buttonData) => {
  try {
    const userData = await getCurrentUserData();
    if (!userData || !userData.organizationId) {
      throw new Error('Usuario no autenticado o sin organización');
    }
    
    const docRef = await addDoc(collection(db, 'organizations', userData.organizationId, 'buttons'), {
      ...buttonData,
      createdAt: new Date().toISOString(),
      createdBy: userData.uid
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating button:', error);
    throw error;
  }
};

// Update a button
export const updateButton = async (id, buttonData) => {
  try {
    const userData = await getCurrentUserData();
    if (!userData || !userData.organizationId) {
      throw new Error('Usuario no autenticado o sin organización');
    }
    
    const buttonRef = doc(db, 'organizations', userData.organizationId, 'buttons', id);
    await updateDoc(buttonRef, {
      ...buttonData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating button:', error);
    throw error;
  }
};

// Delete a button
export const deleteButton = async (id) => {
  try {
    const userData = await getCurrentUserData();
    if (!userData || !userData.organizationId) {
      throw new Error('Usuario no autenticado o sin organización');
    }
    
    const buttonRef = doc(db, 'organizations', userData.organizationId, 'buttons', id);
    await deleteDoc(buttonRef);
  } catch (error) {
    console.error('Error deleting button:', error);
    throw error;
  }
};
