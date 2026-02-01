# Sistema de Roles y Permisos

## 📋 Descripción General

Se ha implementado un sistema de 3 roles en el centro (organización) con permisos diferenciados para controlar qué acciones puede realizar cada tipo de usuario.

---

## 🎯 Los Tres Roles

### 1. **Administrador** (admin)
El creador de la organización y administrador principal.

**Permisos:**
- ✅ Crear botones
- ✅ Editar botones
- ✅ Eliminar botones
- ✅ Invitar miembros (con código de invitación)
- ✅ Cambiar roles de otros miembros
- ✅ Crear y editar perfiles de pacientes
- ✅ Ver análiticas y estadísticas

**Rol asignado:** Automáticamente al crear la organización

---

### 2. **Especialista** (especialista)
Profesional (terapeuta, logopeda, etc.) con permisos para crear contenido.

**Permisos:**
- ✅ Crear botones
- ✅ Editar botones
- ✅ Eliminar botones
- ✅ Invitar miembros (con código de invitación)
- ❌ NO puede cambiar roles de otros miembros
- ❌ NO puede crear ni editar perfiles
- ✅ Ver análiticas y estadísticas

**Rol asignado:** Por el Administrador en "Gestión del Centro"

---

### 3. **Miembro** (miembro)
Usuario con acceso limitado, puede usar la aplicación pero no crear contenido.

**Permisos:**
- ❌ NO puede crear botones
- ❌ NO puede editar botones
- ❌ NO puede eliminar botones
- ❌ NO puede invitar miembros
- ❌ NO puede cambiar roles
- ❌ NO puede crear ni editar perfiles
- ❌ NO puede ver análiticas

**Rol asignado:** Por defecto cuando se une a través de código de invitación

---

## 🔐 Control de Permisos en la Interfaz

### En Panel de Administración

**Crear Botones:**
- Solo Administrador y Especialista pueden hacer clic en "Crear Nuevo Botón"
- Los Miembros ven el botón deshabilitado (gris) con mensaje de ayuda
- Se muestra un aviso rojo explicando la restricción

**Editar/Eliminar Botones:**
- Los botones de Editar (✏️) y Eliminar (🗑️) en cada botón son:
  - Azul y funcional para Admin/Especialista
  - Gris y deshabilitado para Miembros

**Crear Perfiles:**
- Solo Administrador y Especialista pueden hacer clic en "Nuevo Perfil"
- Botón deshabilitado para Miembros

**Invitar Miembros:**
- Solo Administrador y Especialista ven el código de invitación
- Los Miembros ven un mensaje: "Solo Administradores y Especialistas pueden invitar miembros"

---

## 🛠️ Gestión de Roles

### Cómo cambiar el rol de un miembro

1. Ve a **Panel de Administración** → Tab **"Gestión del Centro"**
2. Ubica el miembro en la lista "Miembros del Centro"
3. Haz clic en el dropdown con el rol actual (azul: Miembro, verde: Especialista, naranja: Administrador)
4. Selecciona el nuevo rol:
   - **Miembro**: Acceso limitado (solo usar la app)
   - **Especialista**: Puede crear contenido e invitar
   - **Administrador**: Control total (solo el actual admin puede verlo)

---

## 📊 Funciones de Permiso en el Código

### En `src/services/authService.js`

```javascript
// Verificar si puede crear/editar/borrar botones
canManageButtons() → true (Admin/Especialista) | false (Miembro)

// Verificar si puede invitar miembros
canInviteMembers() → true (Admin/Especialista) | false (Miembro)

// Obtener todos los permisos del usuario
getUserPermissions() → {
  canCreateButtons: boolean,
  canEditButtons: boolean,
  canDeleteButtons: boolean,
  canInviteMembers: boolean,
  canManageRoles: boolean,
  canManageProfiles: boolean,
  canViewAnalytics: boolean,
  label: 'Administrador' | 'Especialista' | 'Miembro'
}
```

---

## 🔄 Flujo de Asignación de Roles

### Al crear una nueva organización
```
Usuario → Crea organización → ¡Automáticamente Admin!
```

### Al unirse con código de invitación
```
Usuario → Ingresa código → Se une → Rol por defecto: Miembro
                                    ↓
                            Admin puede cambiar a Especialista
```

### Cambio de rol (solo Admin)
```
Admin → Gestión del Centro → Selecciona miembro → Cambia rol en dropdown
```

---

## 💡 Casos de Uso Recomendados

### Estructura típica de un Centro

**Opción 1: Jerarquía simple**
- 1 **Administrador** (Director/Coordinador)
- 2-3 **Especialistas** (Terapeutas, Logopedas)
- N **Miembros** (Asistentes, Padres con acceso)

**Opción 2: Colaborativo**
- Todos son **Especialistas** (colaboran en crear contenido)
- 1 **Administrador** (gestión general)

**Opción 3: Jerárquico completo**
- 1 **Administrador** (control total)
- Algunos **Especialistas** (crean contenido)
- Muchos **Miembros** (solo usan, no crean)

---

## ⚠️ Restricciones Importantes

### El Administrador
- ✅ Puede cambiar su propio rol a Especialista (pero entonces perderá control)
- ❌ No puede quitarse a sí mismo el rol de Admin directamente (se ve deshabilitado)
- ✅ Puede promover a otro usuario a Admin

### Los Especialistas
- ✅ Pueden ver el rol de otros miembros
- ❌ NO pueden cambiar roles (eso solo lo hace el Admin)
- ✅ Tienen las mismas capacidades de creación que el Admin

### Los Miembros
- ❌ No ven opciones de gestión
- ❌ No pueden hacer nada administrativo
- ✅ Pueden usar todos los comunicadores creados

---

## 🔍 Verificación de Roles

Para verificar el rol de un usuario en tiempo real:

1. **En el panel**: Mira la etiqueta junto a tu nombre (después de "Bienvenido")
2. **Ejemplos**:
   - "Rol: **Administrador**" → eres Admin
   - "Rol: **Especialista**" → eres Especialista
   - "Rol: **Miembro**" → eres Miembro

---

## 📝 Registro en Firestore

Los roles se almacenan en dos lugares:

### En la colección `users/[userId]`
```json
{
  "email": "usuario@example.com",
  "displayName": "Juan García",
  "organizationId": "org_123",
  "role": "especialista",
  "createdAt": "2025-02-01T..."
}
```

### En `organizations/[orgId]/members/[userId]`
```json
{
  "email": "usuario@example.com",
  "displayName": "Juan García",
  "role": "especialista",
  "joinedAt": "2025-02-01T..."
}
```

---

## 🚀 Próximas Mejoras Posibles

- [ ] Roles personalizados (crear roles con permisos específicos)
- [ ] Historial de cambios de roles
- [ ] Restricciones por grupos de pacientes
- [ ] Permisos más granulares por tipo de botón
- [ ] Auditoría de acciones (quién creó/editó qué)

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo tener múltiples Administradores?**
R: Sí, el Admin actual puede promover a otros usuarios a Admin.

**P: ¿Qué pasa si todos son Especialistas?**
R: Funciona bien, pero nadie podrá gestionar roles. Se recomienda al menos 1 Admin.

**P: ¿Puedo ver qué hace cada rol sin ir a Gestión del Centro?**
R: Sí, los botones deshabilitados muestran un tooltip ("Solo Administrador...") al pasar el mouse.

**P: ¿Los Miembros ven los botones creados por Especialistas?**
R: Sí, todos ven todos los botones y perfiles. La diferencia es **quién puede crearlos/editarlos**.

**P: ¿Cómo sé qué rol tiene cada miembro?**
R: Ve a **Gestión del Centro** y mira el estado en color y el dropdown de roles.

---

**Versión:** 1.0
**Última actualización:** 1 de febrero de 2026
