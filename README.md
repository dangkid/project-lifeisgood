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

### 📱 **PWA (Progressive Web App)**
- ✅ **Instalable**: Funciona como app nativa
- ✅ **Offline**: Service Worker
- ✅ **Responsive**: Todos los tamaños de pantalla

## 🏗️ **Sistema de Organizaciones y Roles**

ComunicaCentros implementa un sistema completo de **organizaciones** y **roles** para gestionar múltiples centros:

### 🏢 **Organizaciones (Centros)**
- Cada organización es un centro independiente
- Código de invitación para unir miembros
- Gestión centralizada de pacientes y botones

### 👑 **Sistema de 3 Roles**

#### **Administrador**
- ✅ Crear, editar y eliminar botones
- ✅ Crear, editar y eliminar perfiles de pacientes
- ✅ Invitar miembros al centro
- ✅ Cambiar roles de otros usuarios
- ✅ Acceso total a todas las funcionalidades

#### **Especialista**
- ✅ Crear, editar y eliminar botones
- ✅ Invitar miembros al centro
- ✅ Ver estadísticas y progreso
- ❌ No puede cambiar roles
- ❌ No puede crear perfiles de pacientes

#### **Miembro**
- ✅ Acceso a todos los comunicadores
- ✅ Ver perfiles y contenido
- ❌ No puede crear ni editar botones
- ❌ No puede invitar miembros
- ❌ No puede cambiar roles

## 🚀 INSTALACIÓN Y USO

### Requisitos
```bash
Node.js >= 18
npm >= 9
```

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase
Crea `.env.local` basado en `.env.example`:
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

### 4. Despliegue a Firebase
```bash
npm run build
firebase deploy --only hosting,firestore
```

## 🎮 CÓMO USAR

### Primeros pasos
1. **Registrarse** como nuevo usuario
2. **Crear una organización** o **unirse a una existente** con código de invitación
3. **Configurar pacientes** (si eres administrador o especialista)
4. **Crear botones** de comunicación personalizados

### Vista del Paciente
1. Selecciona categoría (Necesidades, Emociones, etc.)
2. Presiona botones para construir frase
3. Presiona "Decir Frase" 
4. Usa "Borrar" para empezar de nuevo

### Modo Escáner
1. Activa icono de escáner
2. Los botones se resaltan automáticamente
3. Presiona ESPACIO para seleccionar

## 🔧 TECNOLOGÍAS

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **APIs**: ARASAAC (pictogramas), Web Speech API (TTS)
- **PWA**: Service Worker para funcionamiento offline
- **Despliegue**: Firebase Hosting + Cloud Functions

## 📂 ESTRUCTURA DEL PROYECTO

```
src/
├── components/          # Componentes React
│   ├── admin/          # Panel de administración
│   ├── patient/        # Vista del paciente
│   └── shared/         # Componentes compartidos
├── pages/              # Páginas principales
│   ├── PatientView.jsx
│   ├── AdminView.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── services/           # Servicios y lógica de negocio
│   ├── authService.js      # Autenticación
│   ├── buttonService.js    # Gestión de botones
│   ├── profileService.js   # Perfiles de pacientes
│   └── ttsService.js       # Text-to-Speech
├── contexts/           # Contextos de React
├── hooks/              # Custom hooks
├── config/             # Configuraciones
└── i18n/               # Internacionalización
```

## 🔐 SEGURIDAD

- **Firestore Rules**: Reglas de seguridad granular por organización y rol
- **Autenticación**: Firebase Authentication con email/password
- **Autorización**: Sistema de roles con permisos diferenciados
- **Validación**: Validación en frontend y backend

## 📞 SOPORTE Y CONTACTO

- **Documentación**: Consulta la carpeta `docs/` para guías detalladas
- **Issues**: Reporta problemas en el repositorio de GitHub
- **Mejoras**: Sugerencias y contribuciones son bienvenidas

## 🎯 PRÓXIMAS MEJORAS

- [ ] Analytics de uso avanzado
- [ ] Más idiomas (inglés, catalán, francés)
- [ ] Reconocimiento de voz para entrada
- [ ] Predicción de palabras inteligente
- [ ] Roles personalizados con permisos configurables
- [ ] Historial de auditoría completo

---

**¡Life is Good! 🎉**

*ComunicaCentros - Democratizando la comunicación para todos*
