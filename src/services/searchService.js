/**
 * Servicio de Búsqueda Avanzada
 * Búsqueda de botones, perfiles y recursos con filtros
 */

import { 
  query, 
  collection, 
  where, 
  getDocs,
  orderBy,
  limit,
  startAfter,
  getDoc,
  doc
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

/**
 * Tipos de búsqueda soportados
 */
export const SEARCH_TYPES = {
  BUTTONS: 'buttons',
  PROFILES: 'profiles',
  RESOURCES: 'resources',
  ALL: 'all'
};

/**
 * Buscar botones con filtros
 */
export async function searchButtons(orgId, {
  text = '',
  category = null,
  color = null,
  createdBy = null,
  limit: resultLimit = 20,
  startAfterDoc = null
} = {}) {
  try {
    if (!orgId) throw new Error('Organization ID requerido');

    // Construir condiciones de filtro
    const conditions = [
      where('organizationId', '==', orgId),
      where('deleted', '==', false) // No mostrar eliminados
    ];

    // Filtro de texto (búsqueda en title y shortText)
    if (text && text.trim()) {
      const searchText = text.toLowerCase().trim();
      conditions.push(
        where('searchIndex', 'array-contains', searchText)
      );
    }

    // Filtro por categoría
    if (category && category !== 'all') {
      conditions.push(where('category', '==', category));
    }

    // Filtro por color
    if (color && color !== 'all') {
      conditions.push(where('color', '==', color));
    }

    // Filtro por creador
    if (createdBy) {
      conditions.push(where('createdBy', '==', createdBy));
    }

    // Agregar ordenamiento y límite
    conditions.push(
      orderBy('createdAt', 'desc'),
      limit(resultLimit)
    );

    // Paginación si existe startAfterDoc
    if (startAfterDoc) {
      const startAfterSnapshot = await getDoc(startAfterDoc);
      conditions.splice(-1, 0, startAfter(startAfterSnapshot));
    }

    const q = query(collection(firestore, `organizations/${orgId}/buttons`), ...conditions);
    const snapshot = await getDocs(q);

    return {
      data: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === resultLimit
    };
  } catch (error) {
    console.error('Error searching buttons:', error);
    throw error;
  }
}

/**
 * Buscar perfiles con filtros
 */
export async function searchProfiles(orgId, {
  text = '',
  type = null, // 'patient', 'therapist', 'admin'
  status = null, // 'active', 'inactive'
  limit: resultLimit = 20,
  startAfterDoc = null
} = {}) {
  try {
    if (!orgId) throw new Error('Organization ID requerido');

    const conditions = [
      where('organizationId', '==', orgId),
      where('deleted', '==', false)
    ];

    // Búsqueda por nombre o descripción
    if (text && text.trim()) {
      const searchText = text.toLowerCase().trim();
      conditions.push(
        where('searchIndex', 'array-contains', searchText)
      );
    }

    // Filtro por tipo de perfil
    if (type && type !== 'all') {
      conditions.push(where('type', '==', type));
    }

    // Filtro por estado
    if (status && status !== 'all') {
      conditions.push(where('status', '==', status));
    }

    conditions.push(
      orderBy('updatedAt', 'desc'),
      limit(resultLimit)
    );

    if (startAfterDoc) {
      const startAfterSnapshot = await getDoc(startAfterDoc);
      conditions.splice(-1, 0, startAfter(startAfterSnapshot));
    }

    const q = query(collection(firestore, `organizations/${orgId}/profiles`), ...conditions);
    const snapshot = await getDocs(q);

    return {
      data: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === resultLimit
    };
  } catch (error) {
    console.error('Error searching profiles:', error);
    throw error;
  }
}

/**
 * Búsqueda global (botones + perfiles)
 */
export async function globalSearch(orgId, searchText, options = {}) {
  try {
    if (!orgId) throw new Error('Organization ID requerido');
    if (!searchText || !searchText.trim()) {
      return { buttons: [], profiles: [], resources: [] };
    }

    const [buttonsResult, profilesResult] = await Promise.all([
      searchButtons(orgId, { 
        text: searchText, 
        limit: options.limit || 10 
      }),
      searchProfiles(orgId, { 
        text: searchText, 
        limit: options.limit || 10 
      })
    ]);

    return {
      buttons: buttonsResult.data,
      profiles: profilesResult.data,
      total: buttonsResult.data.length + profilesResult.data.length
    };
  } catch (error) {
    console.error('Error in global search:', error);
    throw error;
  }
}

/**
 * Obtener categorías disponibles
 */
export async function getAvailableCategories(orgId) {
  try {
    if (!orgId) throw new Error('Organization ID requerido');

    const q = query(
      collection(firestore, `organizations/${orgId}/buttons`),
      where('deleted', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const categories = new Set();

    snapshot.docs.forEach(doc => {
      if (doc.data().category) {
        categories.add(doc.data().category);
      }
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}

/**
 * Obtener colores disponibles
 */
export async function getAvailableColors(orgId) {
  try {
    if (!orgId) throw new Error('Organization ID requerido');

    const q = query(
      collection(firestore, `organizations/${orgId}/buttons`),
      where('deleted', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const colors = new Set();

    snapshot.docs.forEach(doc => {
      if (doc.data().color) {
        colors.add(doc.data().color);
      }
    });

    return Array.from(colors).sort();
  } catch (error) {
    console.error('Error getting colors:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de búsqueda
 */
export async function getSearchStatistics(orgId) {
  try {
    if (!orgId) throw new Error('Organization ID requerido');

    // Contar botones
    const buttonsQ = query(
      collection(firestore, `organizations/${orgId}/buttons`),
      where('deleted', '==', false)
    );
    const buttonsSnapshot = await getDocs(buttonsQ);

    // Contar perfiles
    const profilesQ = query(
      collection(firestore, `organizations/${orgId}/profiles`),
      where('deleted', '==', false)
    );
    const profilesSnapshot = await getDocs(profilesQ);

    // Categorías
    const categories = await getAvailableCategories(orgId);

    return {
      totalButtons: buttonsSnapshot.size,
      totalProfiles: profilesSnapshot.size,
      availableCategories: categories.length,
      categories: categories,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting search statistics:', error);
    throw error;
  }
}

/**
 * Crear índice de búsqueda para un botón
 * (Debe llamarse cuando se crea/actualiza un botón)
 */
export function createSearchIndex(title, shortText = '', category = '') {
  const searchText = `${title} ${shortText} ${category}`.toLowerCase().trim();
  // Dividir en palabras y crear índice
  return searchText
    .split(/\s+/)
    .filter(word => word.length > 1)
    .slice(0, 20); // Limitar a 20 palabras
}
