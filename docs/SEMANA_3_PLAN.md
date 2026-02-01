# 🚀 PRÓXIMOS PASOS - Semana 3

## 📍 Estado Actual

✅ **Semana 1:** Seguridad (Firestore Rules, Admin Verification, Validation)
✅ **Semana 2:** Features (Notificaciones, Búsqueda, Auditoría)
⏳ **Semana 3:** Integración y Automatización

---

## 🎯 Plan Semana 3 (4.5 horas)

### TAREA 1: Integración en UI (1 hora)

#### 1.1 Agregar NotificationCenter a Navbar
**Archivo:** `src/pages/PatientView.jsx` o tu navbar principal
```jsx
import NotificationCenter from '../components/NotificationCenter';

// En el navbar/header:
<nav className="flex justify-between items-center">
  {/* Logo, menu, etc */}
  <NotificationCenter />
  {/* Usuario */}
</nav>
```

**Ubicación:** Derecha del navbar, antes del botón de usuario

#### 1.2 Crear página de Búsqueda
**Crear archivo:** `src/pages/SearchPage.jsx`
```jsx
import AdvancedSearch from '../components/AdvancedSearch';
import { useAuth } from './Login';

export default function SearchPage() {
  const { organizationId } = useAuth();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Búsqueda</h1>
      <AdvancedSearch organizationId={organizationId} />
    </div>
  );
}
```

**Agregar ruta en App.jsx:**
```jsx
import SearchPage from './pages/SearchPage';
<Route path="/search" element={<SearchPage />} />
```

**Agregar enlace en navbar:**
```jsx
<Link to="/search">🔍 Buscar</Link>
```

#### 1.3 Agregar AuditLog a AdminView
**Archivo:** `src/pages/AdminView.jsx`
```jsx
import AuditLog from '../components/AuditLog';

// En AdminView, después de otras secciones:
<section className="mt-12">
  <AuditLog organizationId={organizationId} />
</section>
```

**Nota:** Solo visible si `isAdmin(orgId)` es true

---

### TAREA 2: Cloud Functions (2 horas)

**Ubicación:** `functions/` (carpeta del proyecto Firebase)

#### 2.1 Notificaciones Automáticas
**Archivo:** `functions/src/notifications.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.notifyOnButtonCreate = functions.firestore
  .document('organizations/{orgId}/buttons/{buttonId}')
  .onCreate(async (snap, context) => {
    const button = snap.data();
    const orgId = context.params.orgId;
    
    // Obtener todos los miembros
    const members = await admin.firestore()
      .collection(`organizations/${orgId}/members`)
      .get();
    
    // Crear notificación para cada uno
    const batch = admin.firestore().batch();
    members.forEach(doc => {
      const userId = doc.id;
      batch.set(
        admin.firestore().doc(`users/${userId}/notifications/${snap.id}`),
        {
          type: 'button_created',
          message: `Nuevo botón: "${button.title}"`,
          organizationId: orgId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
          metadata: { buttonId: snap.id, createdBy: button.createdBy }
        }
      );
    });
    
    return batch.commit();
  });
```

#### 2.2 Auditoría Automática
**Archivo:** `functions/src/audit.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Función auxiliar para detectar cambios
function detectChanges(before, after) {
  const changes = {};
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {})
  ]);
  
  allKeys.forEach(key => {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];
    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changes[key] = { before: beforeVal, after: afterVal };
    }
  });
  
  return changes;
}

exports.auditOnWrite = functions.firestore
  .document('organizations/{orgId}/{collection}/{docId}')
  .onWrite(async (change, context) => {
    const { orgId, collection, docId } = context.params;
    
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    
    // Determinar acción
    let action = 'create';
    if (change.before.exists && !change.after.exists) {
      action = 'delete';
    } else if (change.before.exists && change.after.exists) {
      action = 'update';
    }
    
    // Obtener usuario
    const userId = after.modifiedBy || after.createdBy || 'system';
    
    // Crear log
    return admin.firestore()
      .collection(`organizations/${orgId}/auditLog`)
      .add({
        action,
        documentType: collection,
        documentId: docId,
        userId,
        changes: detectChanges(before, after),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          before: Object.keys(before),
          after: Object.keys(after)
        }
      });
  });
```

#### 2.3 Registrar Login/Logout
**Archivo:** `functions/src/auth.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Cloud Function triggered by Authentication
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userId = user.uid;
  const orgId = user.customClaims?.organizationId;
  
  if (orgId) {
    await admin.firestore()
      .collection(`organizations/${orgId}/auditLog`)
      .add({
        action: 'login',
        userId,
        documentType: 'auth',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { email: user.email }
      });
  }
});
```

---

### TAREA 3: Modificar Servicios (0.5 horas)

Actualizar servicios para **registrar auditoría automáticamente** cuando se crean/actualizan documentos:

#### 3.1 Actualizar `notificationService.js`
```javascript
// Después de crear notificación, registrar en auditoría
import { logAuditAction } from './auditService';

export async function createNotification(userId, notification) {
  try {
    // ... código existente ...
    
    // Registrar en auditoría
    await logAuditAction({
      organizationId: notification.organizationId,
      userId: notification.sentBy || 'system',
      action: 'create',
      documentType: 'notification',
      documentId: docRef.id,
      metadata: { recipientId: userId }
    });
    
    return { id: docRef.id, ...notification };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

### TAREA 4: Testing (1 hora)

#### 4.1 Test de Notificaciones
- [ ] Crear notificación → aparece en NotificationCenter
- [ ] Marcar como leída → desaparece del badge
- [ ] Marcar todo como leído → badge en 0
- [ ] Eliminar → se quita de la lista

#### 4.2 Test de Búsqueda
- [ ] Búsqueda por texto funciona
- [ ] Filtros funcionan (categoría, color)
- [ ] Debouncing (no hace request cada keystroke)
- [ ] Paginación funciona
- [ ] Búsqueda global combina resultados

#### 4.3 Test de Auditoría
- [ ] Admin puede ver logs
- [ ] No-admin no puede ver logs
- [ ] Filtros funcionan
- [ ] Exportación a CSV funciona
- [ ] Cambios se detectan correctamente

---

## 📋 Checklist de Implementación

### Paso 1: Integración de Componentes
```bash
# Verificar que los componentes están importables
node -e "
const path = require('path');
const files = [
  'src/components/NotificationCenter.jsx',
  'src/components/AdvancedSearch.jsx',
  'src/components/AuditLog.jsx'
];
files.forEach(f => console.log('✅', f));
"
```

### Paso 2: Crear Cloud Functions
```bash
# Inicializar funciones (si no existe)
firebase init functions

# Crear archivos en functions/src/
# - notifications.js
# - audit.js
# - auth.js

# Deploy
firebase deploy --only functions
```

### Paso 3: Testing Local
```bash
npm run dev
# Abrir http://localhost:5173
# Interactuar con componentes
```

### Paso 4: Deploy a Producción
```bash
npm run build
firebase deploy
```

---

## 🎯 Objetivos Semana 3

| Objetivo | Horas | Estado |
|----------|-------|--------|
| Integrar NotificationCenter | 0.3h | ⏳ |
| Crear SearchPage | 0.3h | ⏳ |
| Integrar AuditLog | 0.4h | ⏳ |
| Cloud Function: Notificaciones | 0.7h | ⏳ |
| Cloud Function: Auditoría | 0.7h | ⏳ |
| Cloud Function: Auth | 0.3h | ⏳ |
| Actualizar servicios | 0.5h | ⏳ |
| Testing completo | 1.0h | ⏳ |
| Deploy | 0.3h | ⏳ |
| **Total** | **4.5h** | ⏳ |

---

## 📚 Documentación de Referencia

- **Integración:** `docs/INTEGRACION_SEMANA_2.md`
- **Técnica:** `docs/SEMANA_2_IMPLEMENTACION.md`
- **Cloud Functions:** https://firebase.google.com/docs/functions/get-started/web
- **Firestore Triggers:** https://firebase.google.com/docs/firestore/extend-with-functions

---

## 🔗 Recursos Útiles

### Firebase
- [Firebase Console](https://console.firebase.google.com/project/aac-lifeisgood)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/firestore/extend-with-functions)

### Proyecto
- [Aplicación](https://aac-lifeisgood.web.app)
- [GitHub](https://github.com/tu-usuario/project-lifeisgood)
- [Documentación](/docs)

---

## 💡 Tips para Implementación

1. **Integración:** Copiar/pegar componentes es simple, lo difícil es el flujo
2. **Cloud Functions:** Testear localmente con `firebase emulators:start`
3. **Auditoría:** Usar batch writes para múltiples logs (más rápido)
4. **Notificaciones:** Considerar límite de notificaciones por usuario
5. **Testing:** Usar Firestore Emulator para tests sin datos reales

---

## ⚠️ Consideraciones Importantes

- **Limpieza:** Las Cloud Functions deben limpiar notificaciones antiguas
- **Límites:** Firestore tiene límites de escritura (1000/seg por colección)
- **Costo:** Cada notificación = 1 write, cada log = 1 write
- **Seguridad:** Solo crear logs desde el servidor (Cloud Functions)

---

## 🎓 Próximas Semanas

**Semana 4:** Dashboards, Dark Mode, Testing
**Semana 5:** Optimización, Performance, UI Polish
**Semana 6+:** Features adicionales según prioridad

---

**¿Necesitas ayuda con cualquier paso? Avísame y comenzamos con la Semana 3.**

*Última actualización: 2 de Febrero, 2026*
