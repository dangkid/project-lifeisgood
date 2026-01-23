#!/bin/bash

# AAC Life is Good - Script de Ayuda Rápida
# Este script NO se ejecuta, es solo referencia de comandos

echo "==================================="
echo "🚀 AAC Life is Good - Comandos"
echo "==================================="

# 1. PRIMERA VEZ - Instalar dependencias (YA HECHO)
# npm install

# 2. CONFIGURAR FIREBASE
echo ""
echo "📋 PASO 1: Configurar Firebase"
echo "Abre en navegador: firebase-setup.html"
echo "O lee: SETUP.md"

# 3. CREAR ARCHIVO .ENV
echo ""
echo "📋 PASO 2: Crear archivo .env"
echo "Ejecuta:"
echo "  cp .env.example .env"
echo "  nano .env  (o usa VS Code)"
echo "Pega tus credenciales de Firebase"

# 4. INICIAR DESARROLLO
echo ""
echo "📋 PASO 3: Iniciar aplicación"
echo "Ejecuta:"
echo "  npm run dev"
echo ""
echo "Luego abre: http://localhost:5173"

# 5. RUTAS PRINCIPALES
echo ""
echo "🌐 Rutas de la aplicación:"
echo "  /              → Vista del paciente (pública)"
echo "  /admin/login   → Login administrador"
echo "  /admin         → Panel admin (protegido)"

# 6. BUILD PARA PRODUCCIÓN
echo ""
echo "📦 Build para producción:"
echo "  npm run build"
echo "  npm run preview"

# 7. DEPLOYMENT (ejemplo con Firebase Hosting)
echo ""
echo "🚀 Deployment (Firebase Hosting):"
echo "  npm install -g firebase-tools"
echo "  firebase login"
echo "  firebase init hosting"
echo "  npm run build"
echo "  firebase deploy"

# 8. DOCUMENTACIÓN
echo ""
echo "📚 Documentación:"
echo "  START_HERE.md      → Inicio rápido"
echo "  README.md          → Docs completa"
echo "  SETUP.md           → Configuración Firebase"
echo "  EXAMPLES.md        → Ejemplos de botones"
echo "  firebase-setup.html → Setup visual"

# 9. ESTRUCTURA
echo ""
echo "📁 Archivos principales:"
echo "  src/pages/PatientView.jsx        → Interfaz paciente"
echo "  src/pages/AdminView.jsx          → Panel admin"
echo "  src/components/patient/          → Componentes paciente"
echo "  src/components/admin/            → Componentes admin"
echo "  src/services/                    → Servicios Firebase"

# 10. DEBUGGING
echo ""
echo "🔍 Debugging:"
echo "  Consola del navegador: F12 o Cmd+Option+I"
echo "  Ver errores de Firebase en: console.firebase.google.com"

echo ""
echo "==================================="
echo "✅ Todo listo!"
echo "==================================="
