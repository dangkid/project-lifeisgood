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
import { db } from '../config/firebase';

const BUTTONS_COLLECTION = 'buttons';

// Get all buttons (optionally filtered by profile)
export const getButtons = async (profileId = null) => {
  try {
    const q = query(collection(db, BUTTONS_COLLECTION), orderBy('priority', 'asc'));
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
    throw error;
  }
};

// Create a new button
export const createButton = async (buttonData) => {
  try {
    const docRef = await addDoc(collection(db, BUTTONS_COLLECTION), {
      ...buttonData,
      createdAt: new Date().toISOString()
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
    const buttonRef = doc(db, BUTTONS_COLLECTION, id);
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
    const buttonRef = doc(db, BUTTONS_COLLECTION, id);
    await deleteDoc(buttonRef);
  } catch (error) {
    console.error('Error deleting button:', error);
    throw error;
  }
};
