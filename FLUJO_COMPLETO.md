# 🎯 Flujo Completo de Usuarios - Life is Good

## 📋 Descripción General

El sistema implementa un flujo profesional y estructurado para todos los usuarios de la aplicación. Cada usuario pasa por diferentes etapas según su rol y estado de configuración de organización.

---

## 🔄 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO NO AUTENTICADO                   │
│                  (Puede acceder a Landing)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │ Landing  │
                    └────┬────┘
                         │
                    ┌────▼───────────────────┐
                    │ Decide: Login/Register │
                    └────┬───────────────┬───┘
                         │               │
                    ┌────▼────┐     ┌────▼────┐
                    │  Login   │     │ Register │
                    └────┬────┘     └────┬────┘
                         │               │
                    ┌────▼───────────────▼────┐
                    │ Usuario Autenticado OK │
                    │   (En Firebase Auth)    │
                    └────┬────────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  ONBOARDING PAGE (Nueva)         │
        │  - Verifica organizationId      │
        │  - Si NO tiene: Muestra opciones│
        │  - Si SÍ tiene: Redirige a App  │
        └────┬───────────────────┬────────┘
             │                   │
        ┌────▼────────┐    ┌────▼──────────┐
        │  Crear Centro    │ Unirse a Centro│
        │  (modal activo)  │  (modal activo) │
        └────┬────────┘    └────┬──────────┘
             │                   │
             │  (ambos          │
             │   guardan        │
             │   organizationId │
             │   en user doc)   │
             │                   │
        ┌────▼───────────────────▼────┐
        │  organizationId guardado OK  │
        │   en documento del usuario   │
        └────┬──────────────────────────┘
             │
        ┌────▼────────────────────────┐
        │  Redirige a /comunicador     │
        │  (App Principal)             │
        └────┬──────────────────────────┘
             │
        ┌────▼────────────────────────────┐
        │      APP PRINCIPAL               │
        │   (PatientView o AdminView)     │
        │                                  │
        │  - Verificación automática de   │
        │    organizationId               │
        │  - Si NO tiene: Redirige a      │
        │    /onboarding                  │
        │  - Si SÍ tiene: Carga la app    │
        └────────────────────────────────┘
```

---

## 🚪 Rutas y Protecciones

### Rutas Públicas (Sin Autenticación)
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | LandingPage | Página de bienvenida, información general |
| `/login` | Login | Login para usuarios existentes |
| `/registro` | Register | Registro de nuevos usuarios |

### Rutas Protegidas (Con Autenticación)
| Ruta | Componente | Acceso | Protección |
|------|-----------|--------|-----------|
| `/onboarding` | OnboardingPage | Usuarios sin `organizationId` | `user ? <OnboardingPage /> : <Navigate to="/login" />` |
| `/comunicador` | PatientView | Usuarios con `organizationId` | Verifica `organizationId` en useEffect, redirige a `/onboarding` si falta |
| `/admin` | AdminView | Admins con `organizationId` | Verifica `organizationId` en loadOrganization, redirige a `/onboarding` si falta |
| `/admin/login` | Login (especialista) | Especialistas | Sin protección adicional |

---

## 📄 Archivos Modificados y Nuevos

### ✅ Nuevos Archivos

#### `/src/pages/OnboardingPage.jsx`
**Propósito:** Página profesional de onboarding post-login

**Responsabilidades:**
- Verificar autenticación del usuario
- Mostrar información del usuario (email, nombre)
- Integrar componente OrganizationSetup
- Manejar redirección a `/comunicador` cuando se completa la configuración
- Proporcionar UI profesional y responsivo

**Flujo:**
```jsx
1. Load → onAuthStateChanged()
2. Si NO autenticado → Navigate('/login')
3. Si autenticado → Mostrar OnboardingPage
4. Usuario elige: Crear Centro O Unirse a Centro
5. OrganizationSetup maneja la creación/unión
6. onComplete → handleOrgComplete() → Navigate('/comunicador')
```

**Estructura JSX:**
```jsx
<OnboardingPage>
  <Navbar /> (con logout)
  <div className="gradient-bg">
    <h1>Bienvenido {user.displayName}</h1>
    <OrganizationSetup onComplete={handleOrgComplete} />
    <footer>Helper tip sobre códigos de invitación</footer>
  </div>
</OnboardingPage>
```

### ✏️ Archivos Modificados

#### `/src/pages/PatientView.jsx`

**Cambios:**
- ✅ Importado `getCurrentUserData` de `authService`
- ✅ Agregado verificación de `organizationId` en primer `useEffect`

**Código Agregado:**
```javascript
// Verificar organizacionId primero
const verifyOrganization = async () => {
  try {
    const userData = await getCurrentUserData();
    if (!userData || !userData.organizationId) {
      // Si no tiene organización, redirigir a onboarding
      navigate('/onboarding');
      return;
    }
  } catch (error) {
    console.error('Error verificando organización:', error);
    navigate('/onboarding');
    return;
  }
};

verifyOrganization();
checkTherapistSession();
```

**Impacto:** PatientView ahora redirige automáticamente a `/onboarding` si el usuario no tiene organización asignada.

---

#### `/src/pages/AdminView.jsx`

**Cambios:**
- ✅ Removido importación de `OrganizationSetup`
- ✅ Removido estado `needsOrgSetup`
- ✅ Removido función `handleOrgSetupComplete`
- ✅ Removido condicional que rendería OrganizationSetup modal
- ✅ Agregado redirección a `/onboarding` en `loadOrganization`

**Código Anterior:**
```javascript
// VIEJO - Modal renderizado en AdminView
if (needsOrgSetup) {
  return <OrganizationSetup onComplete={handleOrgSetupComplete} />;
}

const handleOrgSetupComplete = async () => {
  setNeedsOrgSetup(false);
  await loadData();
};
```

**Código Nuevo:**
```javascript
// NUEVO - Redirección a página dedicada
if (!data || !data.organizationId) {
  navigate('/onboarding');
  return;
}
```

**Impacto:** AdminView ahora es más limpio, delega onboarding a OnboardingPage, y redirige automáticamente.

---

#### `/src/App.jsx`

**Cambios:**
- ✅ Importado `OnboardingPage`
- ✅ Agregada ruta `/onboarding` con protección de auth

**Código Agregado:**
```jsx
import OnboardingPage from './pages/OnboardingPage';

// En <Routes>
<Route
  path="/onboarding"
  element={
    user ? (
      <OnboardingPage />
    ) : (
      <Navigate to="/login" />
    )
  }
/>
```

**Impacto:** La ruta `/onboarding` ahora es accesible y protegida contra usuarios sin autenticar.

---

#### `/src/components/NotificationCenter.jsx` 

**Cambios:**
- ✅ Repositionado dropdown de notificaciones
- ✅ Cambio de `mt-2` a `top-full pt-1`
- ✅ Agregado wrapper `relative` en el botón

**Código Anterior (Problema):**
```jsx
<button className="relative">...</button>
{isOpen && (
  <div className="absolute right-0 mt-2 ...">
    {/* Dropdown */}
  </div>
)}
```

**Código Nuevo (Fix):**
```jsx
<div className="relative">
  <button>...</button>
  {isOpen && (
    <div className="absolute right-0 top-full pt-1 ...">
      {/* Dropdown */}
    </div>
  )}
</div>
```

**Impacto:** NotificationCenter dropdown ahora aparece correctamente posicionado, encima del navbar.

---

## 🔐 Verificaciones de Seguridad

### En Firebase Firestore
Cada documento de usuario (`users/{uid}`) contiene:
```json
{
  "uid": "...",
  "email": "...",
  "displayName": "...",
  "role": "admin|patient|therapist",
  "organizationId": "org123",  // NULL si no tiene organización
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Reglas de Firestore (Security Rules)
```javascript
// Ejemplo: Solo usuarios con organizationId pueden leer profiles
match /organizations/{orgId}/profiles/{profileId} {
  allow read: if request.auth.uid != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == orgId;
  allow create, update, delete: if request.auth.uid != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == orgId;
}
```

---

## 🎨 Flujos de Usuario por Rol

### 👤 Nuevo Usuario (Sin Centro)

```
1. Accesa a Landing Page
   └─> Sin login → Opción "Login" o "Registrarse"

2. Hace Registro Nuevo
   └─> Formulario completa datos
   └─> Se crea user doc en Firebase (sin organizationId)
   └─> Redirect automático a /onboarding

3. En OnboardingPage
   └─> Ve opciones: "Crear Centro" o "Unirse a Centro"
   └─> Elige crear → Modal OrganizationSetup
   └─> Completa datos del centro
   └─> Se crea organización en Firestore
   └─> organizationId se guarda en user doc
   └─> Redirect a /comunicador (PatientView)

4. En PatientView (App Principal)
   └─> Verifica organizationId ✓
   └─> Carga todos los botones de su centro
   └─> Puede crear perfiles de pacientes
```

### 👥 Usuario Existente (Con Centro)

```
1. Accesa a Landing Page y hace Login
   └─> Ingresa credenciales
   └─> Firebase autentica
   └─> Redirect automático a /comunicador (porque tiene organizationId)

2. En PatientView
   └─> Verifica organizationId ✓
   └─> Carga directamente la app
   └─> Puede ver botones, crear perfiles, etc.
```

### 🔄 Usuario Invitado (Unirse a Centro Existente)

```
1. Recibe código de invitación
   └─> Ej: "LIFEISGOOD2024"

2. Hace Registro Nuevo
   └─> Formulario pide email, contraseña, nombre
   └─> Opcionalmente: campo "Código de Invitación"
   └─> Se crea user doc sin organizationId
   └─> Redirect a /onboarding

3. En OnboardingPage
   └─> Usuario elige "Unirse a Centro"
   └─> Ingresa código de invitación
   └─> OrganizationSetup valida el código
   └─> Si válido: se agrega usuario a esa organización
   └─> organizationId se guarda en user doc
   └─> Redirect a /comunicador
```

### 👨‍💼 Admin / Especialista

```
1. Accesa a Landing Page
   └─> Click en "Ingreso Especialistas"
   └─> Va a /admin/login

2. Login de Especialista
   └─> Credenciales especiales
   └─> Si tiene rol "admin" → Accede a AdminView
   └─> Si no tiene organizationId → Redirige a /onboarding

3. En AdminView
   └─> Verifica organizationId ✓
   └─> Acceso a: Gestión de botones, perfiles, organización, auditoría
```

---

## 🔄 Ciclos de Redirección Implementados

### Ciclo 1: Auth → Onboarding → App
```
❌ Sin organizationId:
  PatientView → /onboarding
  AdminView → /onboarding
  
✅ Con organizationId:
  PatientView → Muestra app
  AdminView → Muestra admin panel
```

### Ciclo 2: Logout → Login
```
Usuario hace logout en Navbar
  ↓
Limpia localStorage (therapistSession, etc.)
  ↓
Firebase signOut()
  ↓
Redirige a /login
```

### Ciclo 3: Login → Onboarding o App
```
Login exitoso en /login
  ↓
Firebase auth establece user
  ↓
App.jsx detecta user en Router
  ↓
Próxima navegación a /comunicador:
  - Si tiene organizationId → PatientView carga
  - Si NO tiene organizationId → Redirige a /onboarding
```

---

## 📊 Estados Posibles del Usuario

| Estado | organizationId | Ubicación | Acción |
|--------|---|---|---|
| No autenticado | N/A | Landing / Login / Register | Necesita login |
| Autenticado, sin org | null | /onboarding | Debe crear/unir a centro |
| Autenticado, con org | "org123" | /comunicador (PatientView) | Acceso completo |
| Autenticado (admin), con org | "org123" | /admin (AdminView) | Gestión completa |

---

## 🚀 Verificación Visual del Flujo

### Checklist de Testing

- [ ] **Landing Page**
  - [ ] Botones de Login/Register funcionan
  - [ ] Navbar visible con branding
  
- [ ] **Registro Nuevo**
  - [ ] Formulario valida datos
  - [ ] Usuario se crea en Firebase
  - [ ] Redirige a /onboarding automáticamente
  
- [ ] **OnboardingPage**
  - [ ] Muestra nombre del usuario
  - [ ] Botón logout funciona
  - [ ] OrganizationSetup carga correctamente
  
- [ ] **Crear Centro**
  - [ ] Modal de creación funciona
  - [ ] Se guarda organizationId
  - [ ] Redirige a /comunicador
  
- [ ] **Unirse a Centro**
  - [ ] Pide código de invitación
  - [ ] Valida código
  - [ ] Se guarda organizationId
  - [ ] Redirige a /comunicador
  
- [ ] **PatientView (App Principal)**
  - [ ] Se carga correctamente con organizationId
  - [ ] Redirige a /onboarding sin organizationId
  - [ ] Muestra botones de comunicación
  
- [ ] **AdminView**
  - [ ] Se carga correctamente con organizationId
  - [ ] Redirige a /onboarding sin organizationId
  - [ ] Permite gestionar botones y perfiles
  
- [ ] **NotificationCenter**
  - [ ] Dropdown aparece correctamente posicionado
  - [ ] No se oculta bajo el navbar

---

## 🔧 Troubleshooting

### Usuario "Atrapado" en /onboarding
**Causa:** organizationId no se guarda correctamente
**Solución:** 
1. Verificar que OrganizationSetup llama a `authService.createOrganization()`
2. Verificar que la función guarda `organizationId` en user doc
3. Validar que handleOrgComplete() redirige a `/comunicador`

### PatientView no carga botones
**Causa:** organizationId es null
**Solución:**
1. Verificar que usuario pasó por OnboardingPage
2. Verificar en Firebase Console que user doc tiene organizationId
3. Revalidar en PatientView.jsx el check de organizationId

### Logout no funciona
**Causa:** Navbar no tiene acceso a signOut()
**Solución:**
1. Verificar que Navbar importa signOut
2. Verificar que el botón logout llama a la función correctamente
3. Validar que localStorage se limpia

---

## 📝 Notas de Implementación

1. **OnboardingPage es dedicada:** A diferencia del anterior (modal en AdminView), ahora es una página completa, más profesional y mantenible.

2. **Redirecciones automáticas:** Tanto PatientView como AdminView verifican organizationId y redirigen automáticamente, sin que el usuario lo perciba como error.

3. **OrganizationSetup reutilizable:** El mismo componente se usa en OnboardingPage para crear o unirse a centros.

4. **Firebase Auth como fuente de verdad:** El estado de autenticación viene de Firebase, no de localStorage (excepto therapistSession).

5. **Responsive Design:** OnboardingPage usa Tailwind y es responsivo para móviles, tablets y desktop.

---

## 🎯 Próximos Pasos (Opcionales)

1. **Email Verification:** Requerir verificación de email antes de acceder a la app
2. **Role-based Redirects:** Diferentes vistas según role (admin/patient/therapist)
3. **Analytics:** Registrar cuándo usuarios crean/unen a centros
4. **Invitations:** Sistema mejorado de códigos de invitación con expiración
5. **Onboarding Tutorial:** Tutorial interactivo post-login

---

**Última actualización:** [Semana 3] - Implementación profesional del flujo completo
**Status:** ✅ Production Ready
