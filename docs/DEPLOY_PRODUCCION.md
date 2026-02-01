# 🚀 DEPLOY A PRODUCCIÓN - Pasos Críticos

**Importante:** Implementar estos pasos ANTES de llevar a producción

---

## ⚠️ PASO 1: Aplicar Firestore Security Rules (CRÍTICO)

Este paso debe hacerse en Firebase Console para que las reglas entren en efecto.

### En Firebase Console:

1. Ve a: `https://console.firebase.google.com`
2. Selecciona tu proyecto `aac-lifeisgood`
3. Firestore Database → Rules (pestaña)
4. Elimina todas las reglas actuales
5. Copia TODO el contenido del archivo [firestore.rules](firestore.rules)
6. Pega en el editor
7. Haz clic en "Publish"

### Validar que se aplicaron:

```javascript
// Test: Intentar cambiar rol (DEBE fallar)
const userRef = doc(db, 'users', 'userId');
await updateDoc(userRef, { role: 'admin' });
// ❌ Esperado: Error "Permission denied"
```

---

## ⚠️ PASO 2: Verificar Variables de Entorno

### En tu proveedor de hosting:

#### **Vercel:**
1. Ve a Settings → Environment Variables
2. Agrega todas las variables de `.env.local`:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_NEWS_API_KEY
VITE_ARASAAC_API_URL
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

#### **Netlify:**
1. Ve a Site Settings → Build & Deploy → Environment
2. Agrega las mismas variables

#### **Firebase Hosting:**
1. Crea archivo `.firebaserc`:
```json
{
  "projects": {
    "default": "aac-lifeisgood"
  }
}
```
2. Deploy: `firebase deploy`

---

## ⚠️ PASO 3: Auditoría de Usuarios

Ejecutar script para detectar problemas antes de producción:

```bash
# 1. Obtener Firebase Service Account Key
#    https://console.firebase.google.com/project/_/settings/serviceaccounts
#    → "Generate new private key" (JSON)

# 2. Guardar como scripts/serviceAccountKey.json

# 3. Instalar dependencia
npm install firebase-admin

# 4. Ejecutar auditoría
node scripts/audit-users.js
```

**Busca estos problemas:**
- ❌ Roles inválidos (algo diferente a admin/especialista/miembro)
- ❌ Usuarios sin rol pero esperando ser admin
- ❌ Usuarios con organizationId que no existe
- ❌ Organizaciones sin administrador

---

## ⚠️ PASO 4: Crear Cloud Functions para Cambios de Rol

Los cambios de rol NUNCA deben hacerse desde el cliente.

### Crear función en Firebase:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Verificar que es admin
  const adminDoc = await admin
    .firestore()
    .collection('organizations')
    .doc(data.organizationId)
    .collection('members')
    .doc(context.auth.uid)
    .get();

  if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Solo administradores pueden cambiar roles'
    );
  }

  // Cambiar rol
  await admin
    .firestore()
    .collection('organizations')
    .doc(data.organizationId)
    .collection('members')
    .doc(data.userId)
    .update({ role: data.newRole });

  // Actualizar también en users (si necesario)
  await admin
    .firestore()
    .collection('users')
    .doc(data.userId)
    .update({
      organizationId: data.organizationId,
      role: data.newRole
    });

  return { success: true };
});
```

### Desplegar función:

```bash
cd functions
firebase deploy --only functions
```

---

## ✅ PASO 5: Testing en Staging

Antes de publicar a producción:

```bash
# Build
npm run build

# Preview local
npm run preview

# Probar:
# 1. Login como usuario normal
# 2. Intentar acceder a /admin
#    → Debe redirigir a home
# 3. Login como admin
# 4. Acceder a /admin
#    → Debe entrar a panel admin
```

---

## ✅ PASO 6: Habilitar Restricción de Dominio (Firebase Console)

Para evitar que otros usen tus API keys:

1. Firebase Console → Project Settings
2. Pestaña "API restrictions"
3. Restringir a:
   - `Cloud Firestore`
   - `Cloud Storage`
   - `Authentication`
4. Agregar dominios autorizados:
   - `lifeisgood.app`
   - `www.lifeisgood.app`
   - Otros dominios de tu aplicación

---

## ✅ PASO 7: Configurar CORS (Si es necesario)

Si tu app está en dominio diferente a las APIs:

```javascript
// En tu backend o Google Cloud Functions
const cors = require('cors');

app.use(cors({
  origin: ['https://lifeisgood.app', 'https://www.lifeisgood.app'],
  credentials: true
}));
```

---

## ✅ PASO 8: Monitoreo y Alertas

### En Firebase Console:

1. Ve a: Firestore → Indexes
   - Crear índices para queries complejas
2. Ve a: Monitoring
   - Configurar alertas para:
     - Escrituras fallidas
     - Lecturas rechazadas
     - Uso de cuota

---

## 📋 CHECKLIST FINAL

- [ ] Security Rules publicadas en Firebase
- [ ] Variables de entorno en hosting
- [ ] Auditoría de usuarios ejecutada sin errores
- [ ] Cloud Functions para roles creadas y deployadas
- [ ] Testing en staging exitoso
- [ ] Restricción de dominio habilitada
- [ ] Índices de Firestore creados
- [ ] Alertas configuradas
- [ ] Backup de datos realizado
- [ ] Plan de rollback documentado

---

## 🆘 EN CASO DE PROBLEMA

Si algo sale mal en producción:

### Rollback de Security Rules:
```javascript
// Volver a reglas permisivas (TEMPORAL - solo para emergencia)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Desabilitar temporarily:
1. Firebase Console → Firestore → Rules
2. Cambiar a reglas permisivas
3. Investigar el problema
4. Re-desplegar reglas seguras

---

## 📞 SOPORTE

Para problemas de seguridad:
- Email: security@lifeisgood.app
- Documentación: [Firestore Security Best Practices](https://firebase.google.com/docs/firestore/security/rules-structure)
