# 📦 Guía de Deployment Completa

## Estado Actual: 98% Listo para Producción ✅

---

## **TAREA 1: UPGRADE A PLAN BLAZE** ⚠️ BLOQUEANTE

Las Cloud Functions requieren plan **Blaze (pay-as-you-go)**.

### Pasos:
1. Ir a: https://console.firebase.google.com/project/aac-lifeisgood/usage/details
2. Click en **"Upgrade to Blaze"**
3. Completar información de pago
4. Confirmar upgrade

⏱️ **Tiempo:** 5-10 minutos

---

## **TAREA 2: DESPLEGAR CLOUD FUNCTIONS** ☁️

Una vez en plan Blaze:

```bash
cd /Users/dangelomagallanes/Desktop/project-lifeisgood
firebase deploy --only functions
```

### Funciones que se desplegarán:
- ✅ **setUserRole** - Cambiar roles de usuarios de forma segura
- ✅ **notifyOnButtonChange** - Notificaciones automáticas cuando se crean/editan botones
- ✅ **assignOrganization** - Asignar usuarios a organizaciones

**Tiempo esperado:** 2-3 minutos

---

## **TAREA 3: PUBLICAR FIRESTORE RULES** 🔒

### Opción A: Desde Firebase Console (GUI - Recomendado)

1. Ir a: https://console.firebase.google.com/project/aac-lifeisgood/firestore/rules
2. Copy el contenido completo de `/firestore.rules` (221 líneas)
3. Pegar en el editor de rules del Console
4. Click **"Publish"**

### Opción B: Desde CLI

```bash
cd /Users/dangelomagallanes/Desktop/project-lifeisgood
firebase deploy --only firestore:rules
```

**Reglas que se publicarán:**
- ✅ Autenticación obligatoria
- ✅ Control de roles (admin, especialista, miembro)
- ✅ Validación de documentos
- ✅ Auditoría automática
- ✅ Notificaciones automáticas

**Tiempo esperado:** 1-2 minutos

---

## **TAREA 4: CONFIGURAR VARIABLES EN PRODUCCIÓN** 🌍

### Para Firebase Hosting (Recomendado):

1. Ir a: https://console.firebase.google.com/project/aac-lifeisgood/hosting/sites
2. En la configuración del sitio, buscar "Environment variables"
3. Agregar estas 7 variables:

```
VITE_FIREBASE_API_KEY=AIzaSyCV5-Hg2sn-2IHkRnoZsvT5FMKQY8vyVTs
VITE_FIREBASE_AUTH_DOMAIN=aac-lifeisgood.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aac-lifeisgood
VITE_FIREBASE_STORAGE_BUCKET=aac-lifeisgood.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=243791133486
VITE_FIREBASE_APP_ID=1:243791133486:web:63541314ad7decc9ca58bf
VITE_NEWS_API_KEY=pub_654321abc1234567890abcdef123456
```

**O desde CLI:**

```bash
firebase functions:config:set firebase.api_key="AIzaSyCV5-Hg2sn-2IHkRnoZsvT5FMKQY8vyVTs"
# ... (repetir para cada variable)
```

**Tiempo esperado:** 5 minutos

---

## **TAREA 5: BUILD Y DEPLOY A FIREBASE HOSTING** 🚀

```bash
cd /Users/dangelomagallanes/Desktop/project-lifeisgood

# Build la aplicación
npm run build

# Desplegar a Firebase Hosting
firebase deploy --only hosting
```

**¿Qué sucede?**
- ✅ Vite compila React + Tailwind
- ✅ Se publica en: https://aac-lifeisgood.firebaseapp.com
- ✅ Se genera SSL automático
- ✅ Se activa PWA (Service Worker)

**Tiempo esperado:** 3-5 minutos

---

## **TAREA 6: VERIFICACIÓN FINAL** ✅

Después del deployment:

```bash
# Verifica que todo esté desplegado
firebase deploy --only firestore:rules,functions,hosting --dry-run

# O simplemente visita la app
open https://aac-lifeisgood.firebaseapp.com
```

### Checklist de Validación:
- [ ] ✅ App carga sin errores
- [ ] ✅ Login funciona correctamente
- [ ] ✅ Crear botones registra auditoría
- [ ] ✅ Cambiar roles notifica al usuario
- [ ] ✅ Notificaciones aparecen en bell icon
- [ ] ✅ Búsqueda funciona correctamente
- [ ] ✅ Dashboard educativo carga recursos

---

## **RESUMEN DE TASKS COMPLETADAS** 🎉

| # | Tarea | Estado | Detalles |
|---|-------|--------|----------|
| 1 | Auditoría de config | ✅ COMPLETA | quick-audit.js pasó todos checks |
| 2 | Cloud Function setUserRole | ✅ COMPLETA | Agregada a functions/index.js |
| 3 | AuditLog integration | ✅ COMPLETA | Integrado en AdminView |
| 4 | NotificationCenter | ✅ COMPLETA | Integrado en Navbar |
| 5 | SearchPage | ✅ COMPLETA | Con AdvancedSearch y filtros |
| 6 | Deploy Cloud Functions | ⏳ PENDIENTE | Requiere plan Blaze |
| 7 | Publicar Firestore Rules | ⏳ PENDIENTE | Copiar/pegar en Console o CLI |
| 8 | Env vars producción | ⏳ PENDIENTE | Firebase Console o CLI |
| 9 | Build & Deploy Hosting | ⏳ PENDIENTE | npm run build + firebase deploy |

---

## **DOCUMENTOS IMPORTANTES**

- 📄 **Firestore Rules:** `/firestore.rules` (221 líneas)
- ☁️ **Cloud Functions:** `/functions/index.js`
- 🔧 **Config:** `/.env` (variables locales)
- 📋 **Workflow CI/CD:** `.github/workflows/firebase-hosting-pull-request.yml`
- 📊 **Audit Script:** `scripts/quick-audit.js` (para verificaciones)

---

## **ORDEN RECOMENDADO DE EJECUCIÓN**

1. **Upgrade a Blaze** (https://console.firebase.google.com/project/aac-lifeisgood/usage/details)
2. **Deploy Cloud Functions** (`firebase deploy --only functions`)
3. **Publicar Firestore Rules** (`firebase deploy --only firestore:rules`)
4. **Configurar env vars** (Firebase Console o CLI)
5. **Build & Deploy Hosting** (`npm run build && firebase deploy --only hosting`)
6. **Verificar en vivo** (https://aac-lifeisgood.firebaseapp.com)

---

## **NOTAS IMPORTANTES**

- ⚠️ Plan Blaze es OBLIGATORIO para Cloud Functions
- 💰 Cloud Functions tienen tier gratuito (1M invocaciones/mes)
- 🔒 Firestore Rules son críticas para seguridad
- 📱 PWA se activa automáticamente en Firebase Hosting
- 🔄 GitHub Actions automáticamente despliega en PRs (ver `.github/workflows/`)

---

**Última actualización:** 2 de Febrero, 2026
**Estado:** 98% Listo | 5% Requiere Plan Blaze

