# 🎯 ComunicaCentros - Plataforma Integral de Comunicación Aumentativa y Educación

**ComunicaCentros** es una plataforma integral que combina herramientas de comunicación aumentativa y alternativa (CAA) con módulos educativos para centros especializados, terapias y educación inclusiva.

## ✨ CARACTERÍSTICAS PRINCIPALES

### 🗣️ **Comunicación Aumentativa**
- ✅ **Construcción de frases**: Selecciona múltiples botones para crear frases completas
- ✅ **Reproducción por voz**: Text-to-Speech con voces diferenciadas (hombre/mujer)
- ✅ **Botones de comunicación**: Interfaz visual con pictogramas ARASAAC
- ✅ **Botones de cuentos**: Reproducción de audio para historias

### 🎓 **Módulos Educativos**
- ✅ **Juegos educativos**: Memoria, rompecabezas, quizzes interactivos
- ✅ **Panel educativo**: Seguimiento de progreso y estadísticas
- ✅ **Recursos de aprendizaje**: Guías, videotutoriales, biblioteca de pictogramas
- ✅ **Foro educativo**: Comunidad para compartir experiencias

### 🎨 **Organización y Categorías**
- ✅ **Categorías visuales**: Necesidades, Emociones, Comida, Actividades
- ✅ **Filtrado inteligente**: Navegación rápida por pestañas
- ✅ **Contexto temporal**: Botones que aparecen según la hora del día
- ✅ **Prioridades**: Sistema de ordenamiento personalizable

### ♿ **Accesibilidad Total**
- ✅ **Modo escáner**: Para usuarios con movilidad limitada (ESPACIO para seleccionar)
- ✅ **Haptic feedback**: Vibración en dispositivos móviles
- ✅ **Alto contraste**: Diseño optimizado para visibilidad
- ✅ **Botones grandes**: Fáciles de presionar

### 🎭 **Personalización Avanzada**
- ✅ **Selector de voz**: Hombre o mujer
- ✅ **Perfiles de usuario**: Múltiples pacientes con configuraciones individuales
- ✅ **Animaciones suaves**: Feedback visual al presionar botones
- ✅ **Branding personalizable**: Adaptable a diferentes centros educativos

## ✨ CARACTERÍSTICAS IMPLEMENTADAS

### 🗣️ Sistema de Comunicación
- ✅ **Construcción de frases**: Selecciona múltiples botones para crear frases completas
- ✅ **Reproducción por voz**: Text-to-Speech con voces diferenciadas (hombre/mujer)
- ✅ **Botones de comunicación**: Interfaz visual con pictogramas ARASAAC
- ✅ **Botones de cuentos**: Reproducción de audio para historias

### 🎨 Organización y Categorías
- ✅ **Categorías visuales**: Necesidades, Emociones, Comida, Actividades
- ✅ **Filtrado inteligente**: Navegación rápida por pestañas
- ✅ **Contexto temporal**: Botones que aparecen según la hora del día
- ✅ **Prioridades**: Sistema de ordenamiento personalizable

### ♿ Accesibilidad
- ✅ **Modo escáner**: Para usuarios con movilidad limitada (ESPACIO para seleccionar)
- ✅ **Haptic feedback**: Vibración en dispositivos móviles
- ✅ **Alto contraste**: Diseño optimizado para visibilidad
- ✅ **Botones grandes**: Fáciles de presionar

### 🎭 Personalización
- ✅ **Selector de voz**: Hombre o mujer
- ✅ **Modo oscuro**: Para reducir fatiga visual
- ✅ **Perfiles de usuario**: Múltiples pacientes con configuraciones individuales
- ✅ **Animaciones suaves**: Feedback visual al presionar botones

### 🖼️ Integración ARASAAC
- ✅ **Búsqueda de pictogramas**: Miles de imágenes disponibles
- ✅ **Preview en tiempo real**: Ver antes de seleccionar
- ✅ **Multiidioma**: Búsqueda en español

### 📱 PWA (Progressive Web App)
- ✅ **Instalable**: Funciona como app nativa
- ✅ **Offline**: Service Worker
- ✅ **Responsive**: Todos los tamaños de pantalla

## 🚀 INSTALACIÓN Y USO

### Requisitos
```bash
Node.js >= 18
npm >= 9
```

### 1. Instalar
```bash
npm install
```

### 2. Configurar Firebase
Crea `.env`:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. Desarrollo
```bash
npm run dev
```

### 4. Deploy a Firebase
```bash
npm run build
firebase deploy --only hosting
```

## 🎮 CÓMO USAR

### Vista del Paciente
1. Selecciona categoría (Necesidades, Emociones, etc.)
2. Presiona botones para construir frase
3. Presiona "Decir Frase" 
4. Usa "Borrar" para empezar de nuevo

### Modo Escáner
1. Activa icono de escáner
2. Los botones se resaltan automáticamente
3. Presiona ESPACIO para seleccionar

### Panel Admin
1. Botón "Admin" → Login
2. Crear/editar botones
3. Configurar categoría, voz, imagen, etc.

## 🔧 TECNOLOGÍAS

- React 18 + Vite
- Tailwind CSS
- Firebase (Firestore + Auth + Hosting)
- ARASAAC API
- Web Speech API
- PWA (Service Worker)

## 📂 ESTRUCTURA

```
src/
├── components/
│   ├── admin/ButtonForm.jsx
│   └── patient/
│       ├── CommunicationButton.jsx
│       ├── StoryButton.jsx
│       └── PhraseBuilder.jsx
├── pages/
│   ├── PatientView.jsx
│   ├── AdminView.jsx
│   └── AdminLogin.jsx
├── services/
│   ├── buttonService.js
│   ├── ttsService.js
│   ├── arasaacService.js
│   └── profileService.js
└── hooks/
    └── useScannerMode.js
```

## 🔐 SISTEMA DE ROLES Y PERMISOS

ComunicaCentros implementa un sistema de **3 roles** para gestionar accesos y permisos en cada centro:

### 👑 **Administrador**
- ✅ Crear, editar y eliminar botones
- ✅ Crear, editar y eliminar perfiles de pacientes
- ✅ Invitar miembros al centro
- ✅ Cambiar roles de otros usuarios
- ✅ Acceso total a todas las funcionalidades

### 👨‍⚕️ **Especialista**
- ✅ Crear, editar y eliminar botones
- ✅ Invitar miembros al centro
- ✅ Ver estadísticas y progreso
- ❌ No puede cambiar roles
- ❌ No puede crear perfiles de pacientes

### 👤 **Miembro**
- ✅ Acceso a todos los comunicadores
- ✅ Ver perfiles y contenido
- ❌ No puede crear ni editar botones
- ❌ No puede invitar miembros
- ❌ No puede cambiar roles

**📚 Documentación completa:** Consulta [ROLES_SISTEMA.md](./ROLES_SISTEMA.md) para más detalles

---

## 🎯 PRÓXIMAS MEJORAS

- [ ] Analytics de uso
- [ ] Más idiomas
- [ ] Reconocimiento de voz
- [ ] Predicción de palabras
- [ ] Roles personalizados
- [ ] Historial de auditoría

---

**¡Life is Good! 🎉**
