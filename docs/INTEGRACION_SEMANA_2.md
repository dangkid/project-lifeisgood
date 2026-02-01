# Guía de Integración - Semana 2

## 1. NotificationCenter en Navbar

El componente `NotificationCenter` muestra un icono de campana con badge de notificaciones no leídas.

### Ubicación recomendada: Navbar/Header

```jsx
// src/components/Navbar.jsx (o tu componente de navbar)
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold">Mi App</h1>
        
        {/* Navegación central */}
        <div className="flex gap-4">
          {/* Tus enlaces... */}
        </div>
        
        {/* Derecha: Notificaciones + Usuario */}
        <div className="flex items-center gap-4">
          <NotificationCenter />
          {/* Otros elementos del usuario */}
        </div>
      </div>
    </nav>
  );
}
```

### Para cambiar el estilo o comportamiento:

1. **Personalizar colores:** Editar clases Tailwind en NotificationCenter.jsx
2. **Cambiar posición:** Usar `absolute/fixed` según necesidad
3. **Integrar modal:** Envolver en Dialog component

---

## 2. AdvancedSearch en una Página

El componente `AdvancedSearch` es una interfaz completa para búsqueda con filtros.

### Crear página dedicada:

```jsx
// src/pages/SearchPage.jsx
import { useAuth } from './Login';
import AdvancedSearch from '../components/AdvancedSearch';

export default function SearchPage() {
  const { user, organizationId } = useAuth();
  
  if (!organizationId) {
    return <p>No tiene organización asignada</p>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Búsqueda Avanzada</h1>
      <AdvancedSearch organizationId={organizationId} />
    </div>
  );
}
```

### Agregar ruta en App.jsx:

```jsx
import SearchPage from './pages/SearchPage';

// En Routes:
<Route path="/search" element={<SearchPage />} />
```

### Agregar enlace en navbar:

```jsx
<Link to="/search" className="text-gray-700 hover:text-blue-600">
  🔍 Buscar
</Link>
```

---

## 3. AuditLog en AdminView

El componente `AuditLog` muestra historial de cambios (solo para admins).

### Integrar en AdminView:

```jsx
// src/pages/AdminView.jsx
import AuditLog from '../components/AuditLog';
import { useAuth } from './Login';

export default function AdminView({ onLogout, user }) {
  const { organizationId } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Estadísticas */}
      </div>
      
      {/* Historial de cambios */}
      <AuditLog 
        organizationId={organizationId}
        userEmail={user?.email}
      />
    </div>
  );
}
```

---

## 4. Crear Notificaciones desde tu Código

### Cuando se crea un botón:

```jsx
import { logAuditAction } from '../services/auditService';
import { notifyOrganizationMembers } from '../services/notificationService';

async function createButton(buttonData) {
  try {
    // Crear botón en Firestore
    const docRef = await addDoc(
      collection(firestore, `organizations/${orgId}/buttons`),
      buttonData
    );
    
    // Registrar en auditoría
    await logAuditAction({
      organizationId: orgId,
      userId: currentUser.uid,
      action: 'create',
      documentType: 'button',
      documentId: docRef.id,
      changes: { 'button': { before: null, after: buttonData } }
    });
    
    // Notificar a todos
    await notifyOrganizationMembers(orgId, {
      type: 'button_created',
      message: `Nuevo botón: "${buttonData.title}" ha sido creado`,
      metadata: { buttonId: docRef.id, createdBy: currentUser.uid }
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Cuando se crea un perfil:

```jsx
async function createProfile(profileData) {
  try {
    const docRef = await addDoc(
      collection(firestore, `organizations/${orgId}/profiles`),
      profileData
    );
    
    await logAuditAction({
      organizationId: orgId,
      userId: currentUser.uid,
      action: 'create',
      documentType: 'profile',
      documentId: docRef.id,
      changes: { 'profile': { before: null, after: profileData } }
    });
    
    await notifyOrganizationMembers(orgId, {
      type: 'profile_created',
      message: `Nuevo perfil: "${profileData.name}" creado`,
      metadata: { profileId: docRef.id }
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## 5. Usar Hook de Notificaciones en Componentes

```jsx
import { useNotifications } from '../hooks/useNotifications';

export default function MyComponent() {
  const { 
    notifications,      // Array de notificaciones
    unreadCount,       // Número de no leídas
    loading,           // Estado de carga
    error,             // Errores
    markAsRead,        // Función para marcar como leída
    deleteNotification // Función para eliminar
  } = useNotifications();
  
  return (
    <div>
      <h2>Tienes {unreadCount} notificaciones nuevas</h2>
      {notifications.map(notif => (
        <div key={notif.id}>
          <p>{notif.message}</p>
          {!notif.read && (
            <button onClick={() => markAsRead(notif.id)}>
              Marcar como leída
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Usar Servicio de Búsqueda Directamente

```jsx
import { 
  searchButtons, 
  searchProfiles, 
  globalSearch 
} from '../services/searchService';

// Búsqueda de botones
async function findButtons() {
  const result = await searchButtons(orgId, {
    text: 'saludo',
    category: 'Saludos',
    limit: 20
  });
  
  console.log(result.data);  // Array de botones
  console.log(result.hasMore); // Si hay más resultados
}

// Búsqueda global
async function search() {
  const result = await globalSearch(orgId, 'hello');
  console.log(result.buttons);  // Botones encontrados
  console.log(result.profiles); // Perfiles encontrados
}
```

---

## 7. Usar Servicio de Auditoría Directamente

```jsx
import { 
  getAuditLogs, 
  getAuditStatistics,
  getUserActivitySummary,
  detectChanges
} from '../services/auditService';

// Ver logs de un usuario
async function viewUserLogs(userId) {
  const logs = await getAuditLogs(orgId, {
    userId: userId,
    action: 'create',
    limit: 50
  });
  console.log(logs);
}

// Ver estadísticas
async function viewStats() {
  const stats = await getAuditStatistics(orgId, { days: 30 });
  console.log(stats.totalActions);
  console.log(stats.actionsByType);
}

// Ver resumen de actividad
async function viewUserActivity(userId) {
  const summary = await getUserActivitySummary(orgId, userId);
  console.log(summary.recentLogs);
  console.log(summary.actionCounts);
}
```

---

## 8. Detectar Cambios Automáticamente

```jsx
import { detectChanges } from '../services/auditService';

// Cuando editas un botón
const oldButton = { title: 'Hola', color: '#3b82f6' };
const newButton = { title: 'Adiós', color: '#ef4444' };

const changes = detectChanges(oldButton, newButton);
// Resultado:
// {
//   title: { before: 'Hola', after: 'Adiós' },
//   color: { before: '#3b82f6', after: '#ef4444' }
// }

// Guardar estos cambios en auditoría
await logAuditAction({
  organizationId: orgId,
  userId: currentUser.uid,
  action: 'update',
  documentType: 'button',
  documentId: buttonId,
  changes: changes
});
```

---

## 9. Testing Local

Para probar antes de desplegar:

```bash
# 1. Compilar
npm run build

# 2. Ejecutar servidor de desarrollo
npm run dev

# 3. Abrir en navegador
# http://localhost:5173

# 4. Interactuar con componentes
```

---

## 10. Solución de Problemas

### NotificationCenter no muestra notificaciones
- ✅ Verificar que el usuario está autenticado
- ✅ Verificar que existen notificaciones en `users/{uid}/notifications`
- ✅ Verificar que las Firestore Rules permiten lectura

### AdvancedSearch está lento
- ✅ Reducir `limit` a 10-15
- ✅ Aumentar `debounce` de 300ms a 500ms
- ✅ Crear índice en Firestore para campos frecuentes

### AuditLog no muestra logs
- ✅ Solo admins pueden ver logs
- ✅ Verificar que el usuario tiene rol `admin`
- ✅ Verificar que existen documentos en `auditLog`

---

## Próximos Pasos

1. ✅ Archivos creados
2. ✅ Reglas de Firestore desplegadas
3. ✅ Aplicación compilada y subida
4. ⏳ **Integrar componentes en rutas**
5. ⏳ **Crear Cloud Functions para automatización**
6. ⏳ **Testing completo**
7. ⏳ **Documentar en README**

---

## Resumen de URLs

- 🌐 Aplicación: https://aac-lifeisgood.web.app
- 📊 Firebase Console: https://console.firebase.google.com/project/aac-lifeisgood
- 📚 Documentación: `/docs/SEMANA_2_IMPLEMENTACION.md`
