# 📊 Visualización del Sistema de Roles

## 🎯 Estructura Jerárquica

```
                    ORGANIZACIÓN (Centro)
                            │
                ┌───────────┼───────────┐
                │           │           │
              👑 ADMIN    👨‍⚕️ ESPECIALISTA  👤 MIEMBRO
           (Administrador)  (Profesional)   (Usuario)
                │           │           │
         Control Total  Crear Contenido  Solo Usar
```

---

## 📋 Tabla Comparativa de Permisos

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                          MATRIZ DE PERMISOS                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ Acción                  │  Admin  │ Especialista │  Miembro               ║
╠═════════════════════════╪═════════╪══════════════╪═════════════════════╣
║ Crear botones           │   ✅    │      ✅      │        ❌            ║
║ Editar botones          │   ✅    │      ✅      │        ❌            ║
║ Eliminar botones        │   ✅    │      ✅      │        ❌            ║
║ Crear perfiles          │   ✅    │      ✅      │        ❌            ║
║ Editar perfiles         │   ✅    │      ✅      │        ❌            ║
║ Invitar miembros        │   ✅    │      ✅      │        ❌            ║
║ Ver código invitación   │   ✅    │      ✅      │        ❌            ║
║ Cambiar roles           │   ✅    │      ❌      │        ❌            ║
║ Ver estadísticas        │   ✅    │      ✅      │        ❌            ║
║ Usar comunicadores      │   ✅    │      ✅      │        ✅            ║
║ Ver perfiles            │   ✅    │      ✅      │        ✅            ║
╚═════════════════════════╧═════════╧══════════════╧═════════════════════╝
```

---

## 🔐 Funcionalidades Protegidas

### Panel de Administración

```
PANEL ADMIN (AdminView.jsx)
├── Botón "Crear Nuevo Botón"
│   ├── Admin: ✅ AZUL (clickeable)
│   ├── Especialista: ✅ AZUL (clickeable)
│   └── Miembro: ❌ GRIS (deshabilitado + aviso)
│
├── Código de Invitación
│   ├── Admin: ✅ VISIBLE
│   ├── Especialista: ✅ VISIBLE
│   └── Miembro: ❌ OCULTO (mostrar aviso)
│
└── Botones Editar/Eliminar
    ├── Admin: ✅ AZUL/ROJO (clickeables)
    ├── Especialista: ✅ AZUL/ROJO (clickeables)
    └── Miembro: ❌ GRIS (deshabilitados)
```

### Gestión de Perfiles

```
PERFILES (AdminProfileManager.jsx)
├── Botón "Nuevo Perfil"
│   ├── Admin: ✅ AZUL (clickeable)
│   ├── Especialista: ✅ AZUL (clickeable)
│   └── Miembro: ❌ GRIS (deshabilitado)
│
└── Botones Editar/Eliminar Perfil
    ├── Admin: ✅ AZUL/ROJO (clickeables)
    ├── Especialista: ✅ AZUL/ROJO (clickeables)
    └── Miembro: ❌ GRIS (deshabilitados)
```

### Gestión del Centro

```
ORGANIZACIÓN (OrganizationManagement.jsx)
└── Selector de Rol de Miembros
    ├── Admin: ✅ PUEDE CAMBIAR a cualquier rol
    ├── Especialista: ❌ VE pero NO PUEDE cambiar
    └── Miembro: ❌ NO VE opciones de cambio
```

---

## 🎨 Código de Colores

```
📊 Estados Visuales

✅ Funcionalidad Habilitada
   └── Botón AZUL/ROJO/VERDE (según acción)
   └── Clickeable con hover effects
   └── Accesible

❌ Funcionalidad Deshabilitada
   └── Botón GRIS
   └── No clickeable
   └── Muestra tooltip al pasar mouse
   └── Ej: "Solo Administrador y Especialista pueden crear botones"

🔴 Alerta/Aviso
   └── Fondo ROJO/ÁMBAR
   └── Texto explicativo
   └── Visible claramente
```

### Por Rol

```
👑 ADMINISTRADOR
├── Color primario: Naranja/Ámbar
├── Botones: Azul (crear) / Verde (stats) / Rojo (eliminar)
└── Acceso: Completo a todo

👨‍⚕️ ESPECIALISTA
├── Color primario: Verde
├── Botones: Azul (crear) / Verde (stats) / Rojo (eliminar)
└── Acceso: Crear contenido + invitar

👤 MIEMBRO
├── Color primario: Azul claro
├── Botones: Grises (deshabilitados)
└── Acceso: Solo lectura
```

---

## 📱 Flujo de Usuario por Rol

### 🔄 Admin

```
Abre App
   ↓
Login (email/password)
   ↓
Crea organización
   ↓
Automáticamente Admin ← 👑
   ↓
Acceso Panel Completo
   ├─ Crear botones
   ├─ Invitar miembros (ver código)
   ├─ Cambiar roles
   └─ Crear perfiles
```

### 🔄 Especialista

```
Recibe código de invitación
   ↓
Abre app → Registro
   ↓
Ingresa código de invitación
   ↓
Se une a organización como "Miembro"
   ↓
Admin lo cambia a Especialista ← 👨‍⚕️
   ↓
Acceso Panel Limitado
   ├─ Crear botones ✅
   ├─ Invitar miembros ✅
   ├─ Ver código invitación ✅
   ├─ Cambiar roles ❌
   └─ Crear perfiles ❌
```

### 🔄 Miembro

```
Recibe código de invitación
   ↓
Abre app → Registro
   ↓
Ingresa código de invitación
   ↓
Se une a organización como "Miembro" ← 👤
   ↓
Acceso Panel Limitado
   ├─ Crear botones ❌
   ├─ Invitar miembros ❌
   ├─ Ver código invitación ❌
   ├─ Cambiar roles ❌
   └─ Crear perfiles ❌
   ↓
Acceso Comunicador Completo ✅
   └─ Usa todos los botones y perfiles
```

---

## 🔑 Funciones de Verificación

```javascript
// En authService.js

canManageButtons()
├─ Admin: true ✅
├─ Especialista: true ✅
└─ Miembro: false ❌

canInviteMembers()
├─ Admin: true ✅
├─ Especialista: true ✅
└─ Miembro: false ❌

getUserPermissions()
└─ Retorna objeto con:
   ├─ canCreateButtons: boolean
   ├─ canEditButtons: boolean
   ├─ canDeleteButtons: boolean
   ├─ canInviteMembers: boolean
   ├─ canManageRoles: boolean
   ├─ canManageProfiles: boolean
   ├─ canViewAnalytics: boolean
   └─ label: 'Administrador' | 'Especialista' | 'Miembro'
```

---

## 🏢 Ejemplo: Centro con Múltiples Usuarios

```
CENTRO DE TERAPIA "VIDA FELIZ"
│
├─ 👑 Juan García (Admin)
│  └─ Rol: Administrador
│     ├─ Crear botones: ✅
│     ├─ Crear perfiles: ✅
│     ├─ Invitar: ✅
│     ├─ Cambiar roles: ✅
│     └─ Acceso: 100%
│
├─ 👨‍⚕️ María López (Especialista)
│  └─ Rol: Especialista
│     ├─ Crear botones: ✅
│     ├─ Crear perfiles: ❌
│     ├─ Invitar: ✅
│     ├─ Cambiar roles: ❌
│     └─ Acceso: 70%
│
├─ 👨‍⚕️ Carlos Ruiz (Especialista)
│  └─ Rol: Especialista
│     ├─ Crear botones: ✅
│     ├─ Crear perfiles: ❌
│     ├─ Invitar: ✅
│     ├─ Cambiar roles: ❌
│     └─ Acceso: 70%
│
├─ 👤 Ana García (Miembro)
│  └─ Rol: Miembro
│     ├─ Crear botones: ❌
│     ├─ Crear perfiles: ❌
│     ├─ Invitar: ❌
│     ├─ Cambiar roles: ❌
│     └─ Acceso: Solo lectura (20%)
│
└─ 👤 Pedro Martín (Miembro)
   └─ Rol: Miembro
      ├─ Crear botones: ❌
      ├─ Crear perfiles: ❌
      ├─ Invitar: ❌
      ├─ Cambiar roles: ❌
      └─ Acceso: Solo lectura (20%)
```

---

## 🎯 Puntos Críticos

### ⚠️ Restricciones de Seguridad

```
ADMIN ÚNICO
├─ ¿Qué pasa si se va?
└─ ⚠️ PROBLEMA: Nadie puede gestionar

SOLUCIÓN:
├─ Promover a otro Admin antes
├─ Tener backup de roles
└─ Contactar soporte en emergencias
```

```
SIN ESPECIALISTA
├─ ¿Quién crea el contenido?
└─ ⚠️ PROBLEMA: Admin cargado de trabajo

SOLUCIÓN:
├─ Promover Miembro a Especialista
├─ Distribuir carga de trabajo
└─ Admin solo gestiona
```

---

## 📊 Estadísticas de Uso

```
Por Centro Típico:

PEQUEÑO (1-3 usuarios)
├─ 1 Admin
├─ 0-1 Especialista
└─ 0-2 Miembros

MEDIANO (5-10 usuarios)
├─ 1-2 Admin
├─ 2-4 Especialista
└─ 2-5 Miembros

GRANDE (10+ usuarios)
├─ 2-3 Admin
├─ 5-10 Especialista
└─ 5+ Miembros
```

---

## 🚀 Escalabilidad

```
CRECIMIENTO:

Fase 1: Un solo Admin
└─ Crea todo, gestiona todo

Fase 2: Agregar Especialistas
└─ Admin delega creación de contenido
└─ Admin solo gestiona

Fase 3: Agregar Miembros
└─ Admin gestiona roles
└─ Especialistas crean contenido
└─ Miembros usan la plataforma

Fase 4: Multi-Admin (opcional)
└─ Cada Admin gestiona su área
└─ Escalabilidad total
```

---

## 🔍 Cómo Verificar el Sistema

### En el Navegador

```
Opción 1: Ver rol en header
├─ Panel Admin
├─ Header superior
├─ Busca "Rol: [tu rol]"
└─ Ahí está mostrado

Opción 2: Intentar crear algo
├─ Panel Admin
├─ Intenta hacer clic en "Crear Nuevo Botón"
├─ Si está azul: tienes permiso ✅
├─ Si está gris: no tienes permiso ❌
└─ Muestra tooltip si pasas mouse

Opción 3: Gestionar roles
├─ Panel Admin
├─ Tab "Gestión del Centro"
├─ Busca lista de miembros
├─ Mira los dropdowns de rol
└─ Si puedes clickear: eres Admin
```

### En el Código

```javascript
// En console del navegador (F12)

// Ver rol actual
console.log(userData.role)

// Ver si puede crear
console.log(await canManageButtons())

// Ver si puede invitar
console.log(await canInviteMembers())

// Ver todos los permisos
console.log(await getUserPermissions())
```

---

**Documento Visual v1.0**  
**Última actualización:** 1 de febrero de 2026  
**Claridad:** ⭐⭐⭐⭐⭐ (Muy visual)
