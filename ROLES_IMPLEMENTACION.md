# Sistema de Roles Implementado - ComunicaCentros

## Resumen de Cambios

Se ha implementado un sistema completo de roles (admin, usuario, terapeuta) en la aplicación ComunicaCentros. Los cambios principales incluyen:

### 1. **Modificaciones en el Servicio de Autenticación** (`src/services/authService.js`)
- Nuevas funciones para manejo de roles:
  - `getUserRole()`: Obtiene el rol del usuario actual
  - `hasUserRole(role)`: Verifica si el usuario tiene un rol específico
  - `isUserTherapist()`: Verifica si el usuario es terapeuta
  - `isUserNormal()`: Verifica si el usuario es usuario normal
  - `getCurrentUserWithRole()`: Obtiene datos completos del usuario con rol

### 2. **Redirección Post-Login Según Rol** (`src/pages/Login.jsx`)
- Modificado el flujo de redirección después del login:
  - **Admin users**: Redirige a `/admin`
  - **Therapist users**: Redirige a `/panel-educativo`
  - **Normal users**: Redirige a `/` (página de inicio)
  - **Default**: Si no tiene rol definido, se asume 'user' y redirige a `/`

### 3. **Rutas Protegidas por Rol** (`src/App.jsx`)
- Creado componente `RoleProtectedRoute` que verifica permisos antes de renderizar rutas
- La ruta `/admin` ahora está protegida y solo accesible para usuarios con rol 'admin'
- Estructura del componente:
  ```jsx
  <RoleProtectedRoute 
    user={user} 
    allowedRoles={['admin']}
    fallbackPath="/"
  >
    <AdminView onLogout={() => setUser(null)} user={user} />
  </RoleProtectedRoute>
  ```

### 4. **Interfaz de Usuario Actualizada** (`src/pages/LandingPage.jsx`)
- La barra de navegación muestra opciones según el rol:
  - **Admin**: Botón "Panel Admin" (azul/púrpura)
  - **Therapist**: Botón "Panel Terapeuta" (verde/cian)
  - **Normal user**: Botón "Mi Perfil" (verde/azul)
- Se eliminó la redirección automática a `/admin` para usuarios no administradores

## Flujo de Autenticación Actualizado

1. **Usuario inicia sesión** → `Login.jsx`
2. **Se obtiene el rol desde Firestore** → `getCurrentUserData()`
3. **Redirección según rol**:
   - `role === 'admin'` → `/admin`
   - `role === 'therapist'` → `/panel-educativo`
   - `role === 'user'` o `null` → `/`
4. **En LandingPage** → Se muestran opciones personalizadas según rol
5. **Acceso a rutas protegidas** → `RoleProtectedRoute` verifica permisos

## Verificación de Seguridad

### Usuarios Normales NO Pueden Acceder a Gestión
- La ruta `/admin` está protegida con `allowedRoles={['admin']}`
- Usuarios con rol 'user' o 'therapist' son redirigidos a `/` (fallbackPath)
- El componente `RoleProtectedRoute` verifica:
  1. Si hay usuario autenticado
  2. Si el rol del usuario está en la lista `allowedRoles`
  3. Si no cumple, redirige a `fallbackPath`

### Roles Disponibles en el Sistema
1. **admin**: Acceso completo a gestión de centros, usuarios y configuración
2. **therapist**: Acceso a herramientas educativas y seguimiento de pacientes
3. **user**: Acceso básico a comunicación, juegos y perfil personal

## Archivos Modificados

1. `src/services/authService.js` - Funciones de manejo de roles
2. `src/pages/Login.jsx` - Lógica de redirección post-login
3. `src/App.jsx` - Componente RoleProtectedRoute y rutas protegidas
4. `src/pages/LandingPage.jsx` - Interfaz adaptada por rol

## Próximos Pasos Recomendados

1. **Crear interfaz de gestión de roles** en el panel de administración
2. **Implementar registro con selección de rol** (admin, therapist, user)
3. **Crear dashboard específico para terapeutas** con herramientas especializadas
4. **Agregar más rutas protegidas** según necesidades de negocio
5. **Implementar auditoría de acceso** para seguimiento de seguridad

## Notas Técnicas

- Los roles se almacenan en Firestore en la colección `users` campo `role`
- Por defecto, usuarios sin rol definido se tratan como 'user'
- El sistema es extensible para agregar nuevos roles sin modificar la lógica central
- La verificación de roles se realiza en el cliente y en Firestore para seguridad adicional

---

**Estado**: ✅ Implementación completada y verificada
**Fecha**: 30 de enero de 2026
**Versión**: 1.0.0