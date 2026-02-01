# 📅 PLAN SEMANA 2 - Sistema de Notificaciones y Búsqueda Avanzada

**Estimación:** 5.5 horas  
**Dificultad:** Media-Alta  
**Prioridad:** 🟡 IMPORTANTE

---

## 🎯 OBJETIVOS SEMANA 2

1. ✅ Sistema de notificaciones en tiempo real
2. ✅ Búsqueda avanzada con filtros
3. ✅ Historial de cambios (auditoría)

---

## 🔔 TAREA 1: Sistema de Notificaciones en Tiempo Real

**Tiempo:** 2 horas  
**Archivos a crear/modificar:**
- [src/services/notificationService.js](src/services/notificationService.js) ← CREAR
- [src/components/NotificationCenter.jsx](src/components/NotificationCenter.jsx) ← CREAR
- [src/hooks/useNotifications.js](src/hooks/useNotifications.js) ← CREAR

### Características:

#### 1. Tipos de Notificaciones:
- **Usuarios**: Nuevo miembro en organización
- **Botones**: Botón nuevo, botón eliminado, botón actualizado
- **Perfiles**: Perfil nuevo, perfil eliminado
- **Sistema**: Cambios importantes

#### 2. Notificaciones en Tiempo Real (Firestore):

```javascript
// src/services/notificationService.js
export const subscribeToNotifications = (userId, callback) => {
  return onSnapshot(
    collection(db, 'users', userId, 'notifications'),
    (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    }
  );
};
```

#### 3. Centro de Notificaciones (UI):

```jsx
// src/components/NotificationCenter.jsx
export default function NotificationCenter() {
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  
  return (
    <div className="notification-center">
      <div className="notifications-list">
        {notifications.map(notif => (
          <div key={notif.id} className={notif.read ? 'read' : 'unread'}>
            <p>{notif.message}</p>
            <span>{formatTime(notif.createdAt)}</span>
            <button onClick={() => deleteNotification(notif.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4. Hook personalizado:

```javascript
// src/hooks/useNotifications.js
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToNotifications(user.uid, setNotifications);
    return unsubscribe;
  }, [user]);
  
  const markAsRead = async (notificationId) => {
    await updateDoc(
      doc(db, 'users', user.uid, 'notifications', notificationId),
      { read: true }
    );
  };
  
  return { notifications, markAsRead };
};
```

### Firestore Estructura:

```
users/{userId}/
  └── notifications/
      ├── notif1
      │   ├── type: 'user_joined' | 'button_created' | etc
      │   ├── message: string
      │   ├── read: boolean
      │   ├── createdAt: timestamp
      │   └── data: { relatedId, etc }
      └── notif2
```

---

## 🔍 TAREA 2: Búsqueda Avanzada con Filtros

**Tiempo:** 2.5 horas  
**Archivos:**
- [src/services/searchService.js](src/services/searchService.js) ← CREAR
- [src/components/AdvancedSearch.jsx](src/components/AdvancedSearch.jsx) ← CREAR

### Características:

#### 1. Servicio de Búsqueda:

```javascript
// src/services/searchService.js
export const searchButtons = async (organizationId, query, filters) => {
  let q = collection(db, 'organizations', organizationId, 'buttons');
  const constraints = [];
  
  // Filtrar por categoría
  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }
  
  // Filtrar por color
  if (filters.color) {
    constraints.push(where('color', '==', filters.color));
  }
  
  // Búsqueda de texto (requiere índice Firestore)
  if (query) {
    constraints.push(
      where('text', '>=', query),
      where('text', '<', query + '\uf8ff')
    );
  }
  
  // Ordenar por fecha
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(50));
  
  const snapshot = await getDocs(query(q, ...constraints));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

#### 2. Componente de Búsqueda:

```jsx
// src/components/AdvancedSearch.jsx
export default function AdvancedSearch({ organizationId }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    color: '',
    dateRange: 'all'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    setLoading(true);
    const data = await searchButtons(organizationId, query, filters);
    setResults(data);
    setLoading(false);
  };
  
  return (
    <div className="advanced-search">
      <input
        placeholder="Buscar botones..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      
      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="">Todas las categorías</option>
        <option value="necesidades">Necesidades</option>
        <option value="emociones">Emociones</option>
        {/* más categorías */}
      </select>
      
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
      
      <div className="results">
        {results.map(button => (
          <ButtonCard key={button.id} button={button} />
        ))}
      </div>
    </div>
  );
}
```

### Índices Firestore Necesarios:

```
Collection: organizations/{orgId}/buttons
Composite Index:
  - text (Ascending)
  - category (Ascending)
  - color (Ascending)
  - createdAt (Descending)
```

---

## 📝 TAREA 3: Historial de Cambios (Auditoría)

**Tiempo:** 1 hora  
**Archivos:**
- [src/services/auditService.js](src/services/auditService.js) ← CREAR
- [src/components/AuditLog.jsx](src/components/AuditLog.jsx) ← CREAR

### Características:

#### 1. Servicio de Auditoría:

```javascript
// src/services/auditService.js
export const logChange = async (organizationId, change) => {
  const auditDoc = {
    timestamp: serverTimestamp(),
    userId: auth.currentUser.uid,
    action: change.action, // 'create', 'update', 'delete'
    collection: change.collection, // 'buttons', 'profiles', etc
    documentId: change.documentId,
    changes: change.changes, // { fieldName: { before, after } }
    ipAddress: change.ipAddress,
    userAgent: navigator.userAgent
  };
  
  return addDoc(
    collection(db, 'organizations', organizationId, 'audit_log'),
    auditDoc
  );
};

export const getAuditLog = async (organizationId, filters = {}) => {
  let q = collection(db, 'organizations', organizationId, 'audit_log');
  const constraints = [];
  
  // Filtrar por usuario
  if (filters.userId) {
    constraints.push(where('userId', '==', filters.userId));
  }
  
  // Filtrar por acción
  if (filters.action) {
    constraints.push(where('action', '==', filters.action));
  }
  
  // Ordenar por fecha
  constraints.push(orderBy('timestamp', 'desc'));
  constraints.push(limit(100));
  
  const snapshot = await getDocs(query(q, ...constraints));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

#### 2. Interfaz de Auditoría:

```jsx
// src/components/AuditLog.jsx
export default function AuditLog({ organizationId }) {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    userId: '',
    action: 'all'
  });
  
  useEffect(() => {
    loadLogs();
  }, [filters]);
  
  const loadLogs = async () => {
    const data = await getAuditLog(organizationId, filters);
    setLogs(data);
  };
  
  return (
    <div className="audit-log">
      <h2>Historial de Cambios</h2>
      
      <div className="filters">
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        >
          <option value="all">Todas las acciones</option>
          <option value="create">Creado</option>
          <option value="update">Actualizado</option>
          <option value="delete">Eliminado</option>
        </select>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Documento</th>
            <th>Cambios</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp.toDate()).toLocaleString()}</td>
              <td>{log.userId}</td>
              <td>
                <span className={`badge badge-${log.action}`}>
                  {log.action}
                </span>
              </td>
              <td>{log.documentId}</td>
              <td>{JSON.stringify(log.changes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Firestore Estructura:

```
organizations/{orgId}/
  └── audit_log/
      ├── log1
      │   ├── timestamp: date
      │   ├── userId: string
      │   ├── action: 'create' | 'update' | 'delete'
      │   ├── collection: string
      │   ├── documentId: string
      │   └── changes: object
      └── log2
```

---

## 🎨 UI/UX Mejoras para Semana 2

1. **Campana de notificaciones** en navbar
   - Mostrar contador de notificaciones no leídas
   - Dropdown con últimas 5 notificaciones

2. **Barra de búsqueda mejorada**
   - Autocompletar
   - Sugerencias en tiempo real
   - Recientes búsquedas

3. **Dashboard mejorado**
   - Widget de actividad reciente
   - Gráficos de uso

---

## 📊 Testing para Semana 2

```javascript
// Test notificaciones
test('debería recibir notificación cuando botón es creado', async () => {
  const { getByText } = render(<NotificationCenter />);
  
  // Crear botón
  await createButton(orgId, { text: 'Hola' });
  
  // Esperar notificación
  await waitFor(() => {
    expect(getByText('Nuevo botón creado')).toBeInTheDocument();
  });
});

// Test búsqueda
test('debería encontrar botones por categoría', async () => {
  const results = await searchButtons(orgId, '', { category: 'emociones' });
  expect(results.length).toBeGreaterThan(0);
});

// Test auditoría
test('debería registrar cambios en el historial', async () => {
  await updateButton(orgId, buttonId, { text: 'Nuevo texto' });
  const logs = await getAuditLog(orgId);
  expect(logs[0].action).toBe('update');
});
```

---

## 🔄 Pasos de Implementación

1. **Crear estructura de carpetas**
   ```bash
   mkdir -p src/services src/components src/hooks
   ```

2. **Implementar notificaciones** (2h)
   - Service
   - Componente
   - Hook

3. **Implementar búsqueda** (2.5h)
   - Service
   - Componente
   - Índices Firestore

4. **Implementar auditoría** (1h)
   - Service
   - Componente

5. **Testing y debugging** (0.5h)

---

## ✅ Requisitos de Firestore

Para que funcione la búsqueda avanzada, necesitas crear estos índices en Firebase Console:

1. Ve a: Firestore → Indexes
2. Click en "Create Index"
3. Collection: `organizations/{orgId}/buttons`
4. Campos:
   - `category` (Ascending)
   - `color` (Ascending)
   - `createdAt` (Descending)

---

## 📚 Próximas Tareas

- [ ] Notificaciones por email
- [ ] Exportar historial a CSV
- [ ] Alertas automáticas
- [ ] Dashboard de análisis

---

## 🆘 Ayuda

Si encuentras problemas:
1. Revisa los logs de Firestore
2. Verifica que los índices estén creados
3. Comprueba que el usuario tiene permisos correctos
