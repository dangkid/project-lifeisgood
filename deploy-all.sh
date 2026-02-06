#!/bin/bash

# Script para desplegar todo después de upgrade a Blaze
# Uso: bash deploy-all.sh

set -e

PROJECT_DIR="/Users/dangelomagallanes/Desktop/project-lifeisgood"
cd "$PROJECT_DIR"

echo "🚀 INICIANDO DEPLOYMENT COMPLETO"
echo "=================================="
echo ""

# Verificar que está logueado en Firebase
echo "✓ Verificando autenticación con Firebase..."
firebase projects:list > /dev/null 2>&1 || {
  echo "❌ No está autenticado con Firebase"
  echo "Ejecute: firebase login"
  exit 1
}

echo "✓ Autenticación verificada"
echo ""

# PASO 1: Cloud Functions
echo "📦 PASO 1: Desplegando Cloud Functions..."
echo "=========================================="
firebase deploy --only functions || {
  echo "❌ Error desplegando Cloud Functions"
  echo "Asegúrese de estar en plan Blaze"
  exit 1
}
echo "✅ Cloud Functions desplegadas"
echo ""

# PASO 2: Firestore Rules
echo "🔒 PASO 2: Publicando Firestore Rules..."
echo "=========================================="
firebase deploy --only firestore:rules || {
  echo "❌ Error publicando Firestore Rules"
  exit 1
}
echo "✅ Firestore Rules publicadas"
echo ""

# PASO 3: Build de la aplicación
echo "🔨 PASO 3: Compilando aplicación..."
echo "====================================="
npm run build || {
  echo "❌ Error compilando aplicación"
  exit 1
}
echo "✅ Aplicación compilada"
echo ""

# PASO 4: Deploy a Firebase Hosting
echo "🌍 PASO 4: Desplegando a Firebase Hosting..."
echo "=============================================="
firebase deploy --only hosting || {
  echo "❌ Error desplegando a Firebase Hosting"
  exit 1
}
echo "✅ Aplicación desplegada a Firebase Hosting"
echo ""

echo "🎉 ¡DEPLOYMENT COMPLETADO EXITOSAMENTE!"
echo "========================================"
echo ""
echo "📱 La aplicación está disponible en:"
echo "   https://aac-lifeisgood.firebaseapp.com"
echo ""
echo "📊 Próximos pasos:"
echo "   1. Visita la URL anterior para verificar"
echo "   2. Prueba login y funcionalidades principales"
echo "   3. Verifica logs en Firebase Console si hay problemas"
echo ""

