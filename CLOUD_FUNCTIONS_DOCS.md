# Cloud Functions - Comunicacentros

## Descripción General

Los Cloud Functions de Comunicacentros automatizan tareas críticas:
1. **Notificaciones en tiempo real** - Alertas cuando se crean/actualizan botones
2. **Auditoría automática** - Registro de todos los cambios en documentos
3. **Notificaciones de invitación** - Alertas cuando se invita a nuevos miembros
4. **Cambios de rol** - Notificaciones cuando cambia el rol de un usuario
5. **Limpieza de datos** - Eliminación automática de datos obsoletos

## Funciones Implementadas

### 1. `notifyOnButtonChange` (Firestore Trigger)
**Trigger:** `onCreate`, `onUpdate` en `/organizations/{orgId}/buttons/{buttonId}`

**Acciones:**
- Detecta creación o actualización de botones
- Obtiene todos los miembros admin/especialista de la organización
- Crea notificaciones para cada miembro
- Almacena en `users/{userId}/notifications`

**Campos de notificación:**
```javascript
{
  type: 'button_change',
  title: string,
  body: string,
  organizationId: string,
  buttonId: string,
  action: 'created' | 'updated',
  timestamp: FieldValue.serverTimestamp(),
  read: boolean,
  icon: string
}
```

**Casos de uso:**
- Especialista crea nuevo botón → Todos los admin/especialista reciben notificación
- Administrador actualiza botón → Todos reciben notificación de cambios

---

### 2. `auditOnChange` (Firestore Trigger)
**Trigger:** `onWrite` en `/organizations/{orgId}/{docType}/{docId}`

**Acciones:**
- Monitorea cambios en cualquier documento de la organización
- Registra el tipo de acción (create, update, delete)
- Almacena datos antes y después del cambio
- Identifica qué campos fueron modificados
- Guarda en `organizations/{orgId}/auditLog`

**Campos de auditoría:**
```javascript
{
  action: 'create' | 'update' | 'delete',
  docType: string,
  docId: string,
  timestamp: FieldValue.serverTimestamp(),
  changes: {
    before: object | null,
    after: object | null,
    changedFields: string[]
  },
  userId: string,
  ipAddress: string
}
```

**Exclusiones automáticas:**
- `auditLog` (evita loops infinitos)
- `notifications` (demasiadas notificaciones)

**Beneficios:**
- Cumplimiento normativo (HIPAA, RGPD)
- Responsabilidad sobre datos de pacientes
- Investigación de cambios sospechosos
- Recuperación de datos antes de cambios

---

### 3. `notifyOnInvitation` (Firestore Trigger)
**Trigger:** `onCreate` en `/organizations/{orgId}/invitations/{invitationId}`

**Acciones:**
- Detecta nueva invitación a usuario
- Obtiene nombre de la organización
- Crea notificación personalizada
- Envía a `users/{userId}/notifications`

**Campos de notificación:**
```javascript
{
  type: 'invitation',
  title: string,
  body: string,
  organizationId: string,
  invitationId: string,
  action: 'invited',
  timestamp: FieldValue.serverTimestamp(),
  read: boolean
}
```

**Flujo:**
1. Usuario A invita a usuario B a organización C
2. Cloud Function detecta invitación
3. Notificación se guarda en perfil de usuario B
4. NotificationCenter muestra nuevo icono de campana
5. Usuario B ve invitación en panel de notificaciones

---

### 4. `notifyOnRoleChange` (Firestore Trigger)
**Trigger:** `onUpdate` en `/organizations/{orgId}/members/{memberId}`

**Acciones:**
- Monitorea cambios en el rol de miembros
- Solo procesa si el rol realmente cambió
- Crea notificación con nuevo rol asignado
- Traduce rol al español para el usuario

**Campos de notificación:**
```javascript
{
  type: 'role_change',
  title: 'Cambio de Rol',
  body: string,
  organizationId: string,
  newRole: string,
  oldRole: string,
  timestamp: FieldValue.serverTimestamp(),
  read: boolean
}
```

**Mapeo de roles:**
- `admin` → Administrador
- `especialista` → Especialista
- `terapeuta` → Terapeuta
- `miembro` → Miembro

**Casos de uso:**
- Promoción de especialista a admin
- Cambio de miembro a terapeuta
- Cualquier modificación de privilegios

---

### 5. `cleanupOldData` (Scheduled Function)
**Trigger:** Diariamente a las 2:00 AM (Zona horaria: America/New_York)

**Acciones:**
- Busca notificaciones leídas más antiguas de 30 días
- Limpia datos obsoletos de todas las organizaciones
- Optimiza consumo de almacenamiento

**Políticas de retención:**
- Notificaciones no leídas: Indefinidas
- Notificaciones leídas: 30 días
- Logs de auditoría: Indefinidos (cumplimiento normativo)

**Beneficios:**
- Base de datos limpia y eficiente
- Menor consumo de Firestore reads/writes
- Cumplimiento de políticas de privacidad

---

## Instalación y Configuración

### 1. Requisitos previos
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Iniciar sesión en Firebase
firebase login
```

### 2. Instalar dependencias
```bash
cd functions
npm install
```

### 3. Variables de entorno (si es necesario)
Crear archivo `functions/.env.local`:
```
REGION=us-central1
```

### 4. Probar localmente (emulador)
```bash
firebase emulators:start --only functions
```

### 5. Desplegar en producción
```bash
npm run deploy
# o
firebase deploy --only functions
```

---

## Testing Local

### Configurar emulador
```bash
firebase emulators:start --only functions,firestore
```

### Probar notificaciones manualmente
1. Ir a Firestore Emulator en `http://localhost:4000`
2. Crear documento en `/organizations/{orgId}/buttons/test-button`
3. Ver console del emulador para logs
4. Verificar que se crearon notificaciones en `/users/{userId}/notifications`

### Verificar auditoría
1. Hacer cambios en cualquier documento
2. Comprobar que se registran en `/organizations/{orgId}/auditLog`
3. Validar formato y campos capturados

---

## Monitoreo en Producción

### Ver logs de Cloud Functions
```bash
firebase functions:log

# o desde Google Cloud Console
gcloud functions log read --limit 50
```

### Monitorar costos
- Cada trigger = 1 invocación
- Usar Firestore console para estimar carga
- Las notificaciones no generan escrituras adicionales (escritas directamente por function)

### Alertas recomendadas
- Error rate > 5% en funciones
- Tiempo de ejecución > 60 segundos
- Fallos de autenticación en Firestore

---

## Troubleshooting

### Problema: Notificaciones no se crean
**Causa probable:** Usuario no tiene permisos Firestore
**Solución:** Verificar `firestore.rules` en documento:
```
match /users/{userId}/notifications/{doc=**} {
  allow write: if request.auth.uid == userId || isAdmin();
}
```

### Problema: Función se ejecuta múltiples veces
**Causa probable:** Escritura recursiva
**Solución:** Verificar exclusiones en `auditOnChange` (excluye `auditLog`)

### Problema: Función nunca se dispara
**Causa probable:** No hay actividad en el path configurado
**Solución:** 
1. Verificar path exacto: `/organizations/{orgId}/buttons/{buttonId}`
2. Comprobar que Firestore security rules permiten escritura

### Problema: Timeout en Cloud Function
**Causa probable:** Función tarda > 60 segundos (límite default)
**Solución:** Aumentar timeout o optimizar código:
```javascript
exports.functionName = functions
  .runWith({ timeoutSeconds: 300 })
  .firestore.document(...)
  .onWrite(...)
```

---

## Seguridad

### Best Practices implementadas
✅ Validación de datos antes de escribir
✅ Límite de escrituras (máx 100 miembros por notificación)
✅ Exclusión de rutas sensibles
✅ Registro de auditoría para todas las acciones
✅ Uso de `admin.firestore()` con credenciales de aplicación

### Casos no permitidos (intentar evitar)
❌ Escritura directa desde cliente (use Cloud Functions)
❌ Acceso a datos sin autenticación
❌ Modificación de auditLog directamente

---

## Performance Metrics

**Estimaciones por operación:**

| Operación | Tiempo | Costo |
|-----------|--------|-------|
| `notifyOnButtonChange` | 500ms-2s | 1 write per member |
| `auditOnChange` | 100-300ms | 1 write always |
| `notifyOnInvitation` | 200-500ms | 1 write |
| `notifyOnRoleChange` | 200-500ms | 1 write |
| `cleanupOldData` | 30-60s | Query + deletes |

---

## Roadmap Futuro

- [ ] Webhook integrations (Slack, email)
- [ ] Scheduled reports via email
- [ ] ML-based anomaly detection en auditoría
- [ ] Real-time analytics dashboard
- [ ] Backup automático diario

---

## Contacto y Soporte

Para issues o preguntas sobre Cloud Functions:
1. Revisar logs: `firebase functions:log`
2. Verificar Firestore rules
3. Validar estructura de datos esperada
4. Consultar documentación oficial: https://firebase.google.com/docs/functions
