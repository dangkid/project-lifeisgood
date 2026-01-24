import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

// Upload image to Firebase Storage
export const uploadImage = async (file, folder = 'images') => {
  try {
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filename);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Upload audio to Firebase Storage
export const uploadAudio = async (file) => {
  return uploadImage(file, 'audio');
};

// Delete file from Firebase Storage
export const deleteFile = async (fileUrl) => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Subir foto de perfil a Firebase Storage
export const uploadProfilePhoto = async (file, profileId) => {
  if (!file) return null;
  
  console.log('uploadProfilePhoto - Iniciando subida:', { file, profileId });
  
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }
  
  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no debe superar 5MB');
  }
  
  try {
    // Crear referencia en Storage
    const timestamp = Date.now();
    const fileName = `profile_${profileId}_${timestamp}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `profile_photos/${fileName}`);
    
    console.log('uploadProfilePhoto - Referencia creada:', fileName);
    
    // Subir archivo
    console.log('uploadProfilePhoto - Subiendo bytes...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('uploadProfilePhoto - Bytes subidos:', snapshot);
    
    // Obtener URL de descarga
    console.log('uploadProfilePhoto - Obteniendo URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('uploadProfilePhoto - URL obtenida:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('uploadProfilePhoto - Error detallado:', error);
    throw new Error(`Error al subir la foto: ${error.message}`);
  }
};
