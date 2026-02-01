# 🛠️ PLAN DE IMPLEMENTACIÓN - Detallado

**Prioridad:** Alta → Baja  
**Tiempo Total Estimado:** 4-6 semanas  
**Equipo:** 1-2 desarrolladores

---

## 🔴 CRÍTICO - IMPLEMENTAR PRIMERO (Semana 1)

### **1. Arreglar Verificación de Admin**

**Archivo:** `src/App.jsx`

**Cambio necesario:**
```javascript
// ❌ MALO - Verificación insegura
const localCheck =
  user.email?.includes('admin') ||
  user.displayName?.includes('Oliver') ||
  user.uid === 'admin';

// ✅ BIEN - Solo Firestore
async function AdminRoute({ user, onLogout }) {
  const [isAdmin, setIsAdmin] = useState(null);
  
  useEffect(() => {
    isUserAdmin().then(setIsAdmin);
  }, [user]);
  
  if (isAdmin === null) return <LoadingSpinner />;
  return isAdmin ? <AdminView /> : <Navigate to="/" />;
}
```

**Tiempo:** 30 minutos  
**Riesgo de Seguridad:** CRÍTICO  

---

### **2. Implementar Firestore Security Rules**

**Archivo:** En Firebase Console

**Código a agregar:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección: users
    match /users/{userId} {
      // Solo el usuario puede leer sus propios datos
      allow read: if request.auth.uid == userId;
      
      // Crear solo con datos iniciales
      allow create: if request.auth.uid == userId 
                    && request.resource.data.keys().hasAll(['email', 'organizationId'])
                    && !('role' in request.resource.data);
      
      // NO permitir cambiar rol desde cliente
      allow update: if request.auth.uid == userId 
                    && !('role' in request.resource.data.diff.changedKeys())
                    && !('organizationId' in request.resource.data.diff.changedKeys());
      
      allow delete: if false; // Nunca borrar
    }
    
    // Colección: organizations
    match /organizations/{orgId} {
      allow read: if exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
      allow create: if request.auth.uid != null;
      allow update, delete: if get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Sub-colección: organizations/{orgId}/members
    match /organizations/{orgId}/members/{userId} {
      allow read: if exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
      allow create: if request.auth.uid == userId; // Solo crear propio
      allow update: if get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role == 'admin';
      allow delete: if get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Sub-colección: organizations/{orgId}/buttons
    match /organizations/{orgId}/buttons/{buttonId} {
      allow read: if exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
      allow create, update: if exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)) 
                            && get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role in ['admin', 'especialista'];
      allow delete: if get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role in ['admin', 'especialista'];
    }
    
    // Sub-colección: organizations/{orgId}/profiles
    match /organizations/{orgId}/profiles/{profileId} {
      allow read: if exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
      allow create, update: if get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role in ['admin', 'especialista'];
      allow delete: if get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**Tiempo:** 1 hora  
**Riesgo si no se hace:** MUY ALTO  

---

### **3. Mover API Keys a Variables de Entorno**

**Archivo:** `src/services/newsService.js`

**Crear `.env.local`:**
```bash
VITE_NEWS_API_KEY=tu_clave_real_aqui
VITE_FIREBASE_API_KEY=tu_clave_aqui
```

**Actualizar código:**
```javascript
// ❌ MALO
const NEWS_API_KEY = 'pub_654321abc1234567890abcdef123456';

// ✅ BIEN
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

if (!NEWS_API_KEY || NEWS_API_KEY.includes('demo')) {
  console.warn('API key not configured, using fallback news');
  return fallbackNews;
}
```

**Tiempo:** 20 minutos  
**Riesgo de Seguridad:** ALTO  

---

### **4. Agregar Validación de Datos**

**Crear archivo:** `src/utils/validation.js`

```javascript
export const validateButton = (data) => {
  const errors = {};
  
  if (!data.text || data.text.trim().length === 0) {
    errors.text = 'El texto es requerido';
  }
  if (data.text.length > 100) {
    errors.text = 'El texto no puede exceder 100 caracteres';
  }
  
  if (!data.category) {
    errors.category = 'La categoría es requerida';
  }
  
  const validCategories = ['necesidades', 'emociones', 'comida', 'actividades'];
  if (!validCategories.includes(data.category)) {
    errors.category = 'Categoría inválida';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProfile = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'El nombre es requerido';
  }
  if (data.name.length > 50) {
    errors.name = 'El nombre no puede exceder 50 caracteres';
  }
  
  if (data.tags && !Array.isArray(data.tags)) {
    errors.tags = 'Las etiquetas deben ser un array';
  }
  if (data.tags && data.tags.length > 10) {
    errors.tags = 'No puede haber más de 10 etiquetas';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

**Tiempo:** 1 hora  
**Beneficio:** Prevenir datos inválidos  

---

## 🟡 IMPORTANTE - Semana 2

### **5. Sistema de Notificaciones**

**Crear archivo:** `src/services/notificationService.js`

```javascript
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const sendNotification = async (userId, title, message, type = 'info') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId: userId,
      title,
      message,
      type, // 'info', 'success', 'warning', 'error'
      read: false,
      createdAt: serverTimestamp(),
      link: null // Para navegar cuando se presiona
    });
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
};

export const getUnreadNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const markAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};
```

**Componente:** `src/components/NotificationBell.jsx`

```javascript
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { getUnreadNotifications, markAsRead } from '../services/notificationService';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await getUnreadNotifications(userId);
      setNotifications(data);
    }, 5000); // Verificar cada 5 segundos
    
    return () => clearInterval(interval);
  }, [userId]);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">Sin notificaciones</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => markAsRead(notif.id)}
                >
                  <h4 className="font-semibold">{notif.title}</h4>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Tiempo:** 2 horas  
**Beneficio:** Comunicación en tiempo real  

---

### **6. Búsqueda Avanzada**

**Crear archivo:** `src/services/searchService.js`

```javascript
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export const searchButtons = async (orgId, searchTerm, filters = {}) => {
  try {
    let q = query(
      collection(db, 'organizations', orgId, 'buttons'),
      orderBy('text')
    );
    
    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtrar por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(button =>
        button.text.toLowerCase().includes(term) ||
        button.category.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por categoría
    if (filters.category) {
      results = results.filter(b => b.category === filters.category);
    }
    
    // Filtrar por creador
    if (filters.createdBy) {
      results = results.filter(b => b.createdBy === filters.createdBy);
    }
    
    return results;
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};
```

**Componente:** `src/components/SearchBar.jsx`

```javascript
import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch, placeholder = 'Buscar...' }) {
  const [value, setValue] = useState('');
  
  const handleChange = (e) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };
  
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && (
        <button
          onClick={() => {
            setValue('');
            onSearch('');
          }}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
```

**Tiempo:** 2 horas  
**Beneficio:** UX mejorada, más rápido encontrar contenido  

---

### **7. Historial de Cambios**

**Crear archivo:** `src/services/changeHistoryService.js`

```javascript
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUserData } from './authService';

export const logChange = async (orgId, entityType, entityId, action, changes) => {
  try {
    const userData = await getCurrentUserData();
    
    await addDoc(collection(db, 'organizations', orgId, 'change_history'), {
      entityType, // 'button', 'profile', 'user'
      entityId,
      action, // 'create', 'update', 'delete'
      changes, // { field: { oldValue, newValue } }
      changedBy: userData.uid,
      changedByName: userData.displayName,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging change:', error);
  }
};

export const getChangeHistory = async (orgId, entityId) => {
  try {
    const q = query(
      collection(db, 'organizations', orgId, 'change_history'),
      where('entityId', '==', entityId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};
```

**Tiempo:** 1.5 horas  
**Beneficio:** Auditoría, recuperar cambios anteriores  

---

## 🟢 IMPORTANTE - Semana 3

### **8. Presets de Categorías**

**Crear archivo:** `src/data/buttonPresets.js`

```javascript
export const BUTTON_PRESETS = {
  emociones: [
    { text: 'Estoy feliz', pictogramId: 8793, color: 'yellow' },
    { text: 'Estoy triste', pictogramId: 8794, color: 'blue' },
    { text: 'Estoy asustado', pictogramId: 8795, color: 'red' },
    { text: 'Estoy cansado', pictogramId: 8798, color: 'purple' },
    { text: 'Estoy enfadado', pictogramId: 8796, color: 'red' },
    { text: 'Estoy relajado', pictogramId: 8799, color: 'green' },
  ],
  necesidades: [
    { text: 'Tengo hambre', pictogramId: 2419, color: 'orange' },
    { text: 'Tengo sed', pictogramId: 2418, color: 'blue' },
    { text: 'Necesito ir al baño', pictogramId: 4258, color: 'purple' },
    { text: 'Necesito ayuda', pictogramId: 9999, color: 'red' },
    { text: 'Quiero descansar', pictogramId: 8800, color: 'green' },
  ],
  actividades: [
    { text: 'Quiero jugar', pictogramId: 10001, color: 'blue' },
    { text: 'Quiero leer', pictogramId: 10002, color: 'green' },
    { text: 'Quiero correr', pictogramId: 10003, color: 'red' },
    { text: 'Quiero ver TV', pictogramId: 10004, color: 'purple' },
  ]
};

export const createButtonFromPreset = (preset) => {
  return {
    text: preset.text,
    image_url: `https://api.arasaac.org/api/pictograms/${preset.pictogramId}`,
    category: 'actividades',
    type: 'communication',
    voice_gender: 'female',
    priority: 0
  };
};
```

**Tiempo:** 1 hora  
**Beneficio:** Setup rápido para nuevos centros  

---

### **9. Análisis Mejorado**

**Crear archivo:** `src/services/analyticsService.js`

```javascript
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export const getUserStats = async (orgId, userId) => {
  try {
    // Total de botones presionados
    const clicksSnapshot = await getDocs(
      query(
        collection(db, 'button_clicks'),
        where('userId', '==', userId),
        where('organizationId', '==', orgId)
      )
    );
    
    // Botones más usados
    const clicks = clicksSnapshot.docs.map(doc => doc.data());
    const bottonUsage = {};
    clicks.forEach(click => {
      bottonUsage[click.buttonId] = (bottonUsage[click.buttonId] || 0) + 1;
    });
    
    const topButtons = Object.entries(bottonUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([buttonId, count]) => ({ buttonId, count }));
    
    // Horas pico de uso
    const hourUsage = {};
    clicks.forEach(click => {
      const hour = new Date(click.timestamp).getHours();
      hourUsage[hour] = (hourUsage[hour] || 0) + 1;
    });
    
    return {
      totalClicks: clicks.length,
      topButtons,
      hourUsage,
      lastActive: clicks.length > 0 ? clicks[clicks.length - 1].timestamp : null
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
};

export const getCenterStats = async (orgId) => {
  try {
    // Usuarios activos
    const usersSnapshot = await getDocs(
      collection(db, 'organizations', orgId, 'members')
    );
    
    // Botones creados
    const buttonsSnapshot = await getDocs(
      collection(db, 'organizations', orgId, 'buttons')
    );
    
    // Perfil creados
    const profilesSnapshot = await getDocs(
      collection(db, 'organizations', orgId, 'profiles')
    );
    
    return {
      totalUsers: usersSnapshot.size,
      totalButtons: buttonsSnapshot.size,
      totalProfiles: profilesSnapshot.size,
      activeToday: Math.floor(Math.random() * usersSnapshot.size), // Placeholder
    };
  } catch (error) {
    console.error('Error getting center stats:', error);
    return null;
  }
};
```

**Tiempo:** 2 horas  
**Beneficio:** Insights sobre uso, reportes  

---

## 🔵 MEJORAS - Semana 4 en adelante

### **10. Modo Oscuro**

```javascript
// En tailwind.config.js, ya está configurado
// Solo necesita UI update

export const useTheme = () => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  
  return { isDark, toggleTheme: () => setIsDark(!isDark) };
};
```

**Tiempo:** 2 horas  
**Beneficio:** Mejor accesibilidad, menos fatiga visual  

---

## 📋 RESUMEN DE IMPLEMENTACIÓN

| Tarea | Tiempo | Prioridad | Dificultad |
|-------|--------|-----------|-----------|
| Arreglar admin verification | 30 min | 🔴 CRÍTICA | Fácil |
| Firestore Rules | 1 hora | 🔴 CRÍTICA | Media |
| API Keys a .env | 20 min | 🔴 CRÍTICA | Fácil |
| Validación de datos | 1 hora | 🔴 CRÍTICA | Media |
| Notificaciones | 2 horas | 🟡 IMPORTANTE | Media |
| Búsqueda avanzada | 2 horas | 🟡 IMPORTANTE | Media |
| Historial de cambios | 1.5 horas | 🟡 IMPORTANTE | Media |
| Presets | 1 hora | 🟢 BUENO | Fácil |
| Análisis mejorado | 2 horas | 🟢 BUENO | Media |
| Modo oscuro | 2 horas | 🟢 BUENO | Fácil |

**TOTAL:** ~15-16 horas de trabajo  

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Semana 1 (Crítico)
- [ ] Arreglar admin verification
- [ ] Implementar Firestore Rules
- [ ] Mover API keys a .env
- [ ] Agregar validación de datos
- [ ] Testing manual de seguridad

### Semana 2 (Importante)
- [ ] Sistema de notificaciones
- [ ] Búsqueda avanzada
- [ ] Historial de cambios
- [ ] Testing de nuevas features

### Semana 3 (Bueno)
- [ ] Presets de categorías
- [ ] Análisis mejorado
- [ ] Documentación de código

### Semana 4+
- [ ] Modo oscuro
- [ ] Más mejoras según feedback
- [ ] Performance optimization
- [ ] Tests automatizados

---

**Plan de Implementación v1.0**  
**Última actualización:** 1 de febrero de 2026  
**Estimado Total:** 4-6 semanas
