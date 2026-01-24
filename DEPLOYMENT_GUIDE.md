# 🚀 Guía de Despliegue - AAC Comunicador

## Opción 1: Firebase Hosting (RECOMENDADO - Ya tienes Firebase)

### Pasos:

1. **Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login en Firebase**
```bash
firebase login
```

3. **Inicializar Firebase Hosting**
```bash
firebase init hosting
```
- Selecciona tu proyecto: `aac-lifeisgood`
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`
- Overwrite index.html: `No`

4. **Compilar el proyecto**
```bash
npm run build
```

5. **Desplegar**
```bash
firebase deploy --only hosting
```

Tu app estará en: `https://aac-lifeisgood.web.app`

---

## Opción 2: Vercel (MUY FÁCIL)

1. Ve a https://vercel.com
2. Conecta tu repositorio de GitHub/GitLab
3. Vercel detecta automáticamente Vite
4. Click en "Deploy"
5. ¡Listo! URL automática

---

## Opción 3: Netlify

1. Ve a https://netlify.com
2. Arrastra la carpeta `dist` (después de `npm run build`)
3. ¡Desplegado!

O con CLI:
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

---

## 📱 Convertir a App Móvil

### PWA (Progressive Web App) - YA CASI LISTA

Tu app ya tiene:
- ✅ manifest.json
- ✅ Service Worker
- ⚠️ Necesita HTTPS (automático al desplegar)

**Para mejorar como PWA:**

1. Actualiza los iconos en `public/`
2. Despliega con HTTPS
3. Los usuarios pueden "Añadir a pantalla de inicio"

**Subir PWA a Google Play Store:**
- Usa Trusted Web Activity (TWA)
- Herramienta: https://www.pwabuilder.com/
- Genera APK automáticamente

### Capacitor (Para apps nativas reales)

1. **Instalar Capacitor**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

2. **Configurar**
- App name: "AAC Comunicador"
- Package ID: com.lifeisgood.aac

3. **Agregar plataformas**
```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

4. **Compilar web**
```bash
npm run build
npx cap sync
```

5. **Abrir en Android Studio / Xcode**
```bash
npx cap open android
npx cap open ios
```

6. **Generar APK/IPA y subir a tiendas**

---

## 🎯 Recomendación

**Para empezar:**
1. Despliega con **Firebase Hosting** (ya tienes todo configurado)
2. Mejora como **PWA** (iconos, offline mode)
3. Si quieres apps nativas, usa **Capacitor**

**Costos:**
- Firebase Hosting: GRATIS hasta 10GB/mes
- Vercel/Netlify: GRATIS para proyectos personales
- Google Play Store: $25 una vez
- Apple App Store: $99/año

---

## 🔥 Comandos Rápidos

```bash
# Compilar para producción
npm run build

# Desplegar a Firebase
firebase deploy --only hosting

# Preview local de producción
npm run preview
```

---

## ⚠️ Antes de Desplegar

1. ✅ Cambia las reglas de Firestore a modo seguro (ya no `allow read, write: if true`)
2. ✅ Verifica que todos los .env estén configurados
3. ✅ Prueba la build local: `npm run build && npm run preview`
4. ✅ Asegúrate que Firebase tenga cuota disponible

---

## 🎉 Siguiente Paso

Ejecuta estos comandos para desplegar AHORA:

```bash
npm run build
firebase login
firebase init hosting
firebase deploy --only hosting
```

¡Tu app estará en vivo en 5 minutos!
