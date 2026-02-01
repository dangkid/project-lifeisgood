# ⚡ Guía Rápida - Sistema de Roles

## 🎯 Lo Esencial en 2 Minutos

### Los 3 Roles del Centro

| Rol | Para quién | Qué puede hacer |
|-----|-----------|-----------------|
| **Administrador** 👑 | Director/Coordinador | Todo: crear botones, invitar, cambiar roles |
| **Especialista** 👨‍⚕️ | Terapeuta/Logopeda | Crear contenido e invitar, pero sin control total |
| **Miembro** 👤 | Asistente/Padre | Solo usar la app, sin crear contenido |

---

## 🚀 Cómo Empezar

### Si eres ADMINISTRADOR (creaste la organización)

✅ **Ya tienes todos los permisos**
- Puedes crear y editar botones
- Puedes invitar gente con el código
- Puedes cambiar roles en "Gestión del Centro"

👉 **Próximo paso:** Invita a tu equipo usando el código en el header

---

### Si eres ESPECIALISTA (te promovieron)

✅ **Puedes crear contenido**
- Crear/editar/eliminar botones
- Invitar miembros

❌ **No puedes cambiar roles** - Solo el Admin puede

👉 **Próximo paso:** Crea los botones y comunicadores que necesites

---

### Si eres MIEMBRO (te invitaron)

✅ **Puedes usar todo lo creado**
- Acceder a todos los comunicadores
- Ver todos los botones

❌ **No puedes crear nada** - Los especialistas crean el contenido

👉 **Próximo paso:** Usa el app, aprende cómo funciona

---

## 🔧 Tareas Comunes

### 📝 Crear un botón
```
Admin/Especialista:
1. Panel Admin → Tab "Botones"
2. Clic en "Crear Nuevo Botón"
3. Rellena los datos
4. Guarda

Miembro:
❌ Botón deshabilitado (gris)
```

### 👥 Cambiar rol de un miembro
```
Solo Admin:
1. Panel Admin → Tab "Gestión del Centro"
2. Busca el miembro en la lista
3. Clic en el dropdown (azul/verde/naranja)
4. Selecciona nuevo rol
```

### 📤 Invitar a nuevo miembro
```
Admin/Especialista:
1. Panel Admin (header superior)
2. Busca "Código para invitar miembros"
3. Clic en copiar
4. Comparte el código por correo/WhatsApp/etc

Miembro:
❌ No ve el código, no puede invitar
```

### 👶 Crear un perfil de paciente
```
Admin/Especialista:
1. Panel Admin → Tab "Pacientes"
2. Clic en "Nuevo Perfil"
3. Rellena datos
4. Guarda

Miembro:
❌ Botón deshabilitado
```

---

## 💡 Ejemplos Reales

### Centro pequeño (1 terapeuta)
```
👑 Administrador: Terapeuta (crea todo, gestiona)
```

### Centro mediano (3-5 terapeutas)
```
👑 Administrador: Coordinador (gestiona a los demás)
👨‍⚕️ Especialista: Terapeuta 1
👨‍⚕️ Especialista: Terapeuta 2
👨‍⚕️ Especialista: Terapeuta 3
```

### Centro con asistentes
```
👑 Administrador: Director
👨‍⚕️ Especialista: Terapeuta 1
👨‍⚕️ Especialista: Terapeuta 2
👤 Miembro: Asistente 1
👤 Miembro: Asistente 2
👤 Miembro: Padre (acompañante)
```

---

## ❓ Preguntas Rápidas

**P: ¿Mi rol aparece en algún lugar?**
R: Sí, arriba en el header donde dice "Bienvenido, [nombre]" → "Rol: Administrador/Especialista/Miembro"

**P: ¿Puedo cambiar mi propio rol?**
R: Solo si eres Admin. Pero asegúrate que otro Admin pueda gestionar después.

**P: Si me promuevo a Admin, ¿pierdo el acceso de Especialista?**
R: No, Admin tiene todos los permisos de Especialista + más.

**P: ¿Los Miembros ven los botones creados?**
R: Sí, todos ven todo. Solo que los Miembros no pueden crear/editar.

**P: ¿Qué pasa si el único Admin se va?**
R: Otro Admin puede tomar el control. Si no hay otro, contacta soporte.

---

## 🔐 Seguridad

**Lo importante que debes saber:**

✅ Solo Admin y Especialista pueden crear contenido
✅ Los Miembros nunca pueden "accidentalmente" borrar un botón
✅ Un Miembro no puede invitar gente (si hay infiltrados, el Admin controla)
✅ Todos los cambios se guardan en Firestore (auditable)

---

## 🔄 Cambios Comunes Después de Empezar

### "Necesito que Juanito sea Especialista"
```
1. Ve a Panel Admin
2. Tab "Gestión del Centro"
3. Encuentra a Juanito
4. Clic en su dropdown de rol
5. Selecciona "Especialista"
6. ¡Listo! Ahora puede crear
```

### "Juanito ya no trabaja con nosotros"
```
1. Ve a Panel Admin
2. Tab "Gestión del Centro"
3. Encuentra a Juanito
4. Clic en "Eliminar"
5. Confirmado: ya no puede acceder
```

### "María necesita ser Admin porque yo me voy"
```
⚠️ Esto es importante:
1. Ve a Panel Admin
2. Tab "Gestión del Centro"
3. Encuentra a María
4. Clic en dropdown: Selecciona "Administrador"
5. Ahora María puede gestionar todo
6. Verifica que todo funcione antes de irte
```

---

## 📞 Necesito Ayuda

- **"No puedo crear botones"** → Pídele al Admin que te promocione a Especialista
- **"No veo el código de invitación"** → Solo Admin/Especialista lo ven
- **"Un Miembro creó un botón"** → Eso no debe ser posible, verifica el rol en "Gestión del Centro"
- **"No sé qué rol soy"** → Mira el header del Panel Admin (abajo del nombre)

---

**Versión:** 1.0  
**Última actualización:** 1 de febrero de 2026  
**Dificultad:** ⭐ Muy fácil
