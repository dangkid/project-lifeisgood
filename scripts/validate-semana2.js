#!/usr/bin/env node

/**
 * Script de Validación - Semana 2
 * Verifica que todos los archivos requeridos estén creados
 * y que las reglas de Firestore sean válidas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Archivos requeridos
const requiredFiles = [
  // Servicios
  'src/services/notificationService.js',
  'src/services/searchService.js',
  'src/services/auditService.js',
  
  // Hooks
  'src/hooks/useNotifications.js',
  
  // Componentes
  'src/components/NotificationCenter.jsx',
  'src/components/AdvancedSearch.jsx',
  'src/components/AuditLog.jsx',
  
  // Rules y Docs
  'firestore.rules',
  'docs/SEMANA_2_IMPLEMENTACION.md'
];

console.log('🔍 Validando archivos de Semana 2...\n');

let allValid = true;

requiredFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  const exists = fs.existsSync(fullPath);
  
  const icon = exists ? '✅' : '❌';
  const status = exists ? 'PRESENTE' : 'FALTANTE';
  
  console.log(`${icon} ${file} - ${status}`);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    const sizeKb = (stats.size / 1024).toFixed(2);
    console.log(`   └─ ${sizeKb} KB`);
  } else {
    allValid = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allValid) {
  console.log('✅ TODOS LOS ARCHIVOS ESTÁN PRESENTES\n');
  
  // Verificar contenido crítico
  console.log('🔐 Verificando contenido crítico...\n');
  
  const rulesPath = path.join(projectRoot, 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  
  const criticalChecks = [
    { name: 'Notifications Rules', search: 'users/{userId}/notifications' },
    { name: 'Audit Log Rules', search: 'auditLog' },
    { name: 'Function: isAuthenticated', search: 'function isAuthenticated()' },
    { name: 'Function: isAdmin', search: 'function isAdmin' },
    { name: 'Function: isEspecialista', search: 'function isEspecialista' },
    { name: 'Function: isMember', search: 'function isMember' }
  ];
  
  let rulesValid = true;
  criticalChecks.forEach(check => {
    const exists = rulesContent.includes(check.search);
    const icon = exists ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    if (!exists) rulesValid = false;
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (rulesValid) {
    console.log('✅ TODAS LAS REGLAS CRÍTICAS ESTÁN PRESENTES\n');
    console.log('📋 Próximos pasos:\n');
    console.log('1. npm run build');
    console.log('2. firebase deploy --only firestore:rules');
    console.log('3. firebase deploy --only hosting\n');
    console.log('4. Integrar componentes en la aplicación\n');
    console.log('5. Crear Cloud Functions para automatización\n');
  } else {
    console.log('❌ FALTAN REGLAS CRÍTICAS\n');
    process.exit(1);
  }
} else {
  console.log('❌ FALTAN ARCHIVOS REQUERIDOS\n');
  process.exit(1);
}
