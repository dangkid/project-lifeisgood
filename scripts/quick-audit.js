#!/usr/bin/env node

/**
 * Quick Audit - Verificación rápida de configuración
 * Este script verifica que todo esté listo sin necesitar credenciales de Firebase
 * 
 * USO: node scripts/quick-audit.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 AUDITORÍA RÁPIDA DE CONFIGURACIÓN\n');
console.log('='.repeat(60));

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const check = (condition, msg, details = '') => {
  if (condition) {
    console.log(`${colors.green}✅${colors.reset} ${msg}`);
    if (details) console.log(`   ${details}`);
  } else {
    console.log(`${colors.red}❌${colors.reset} ${msg}`);
    if (details) console.log(`   ${colors.yellow}${details}${colors.reset}`);
  }
  return condition;
};

let allGood = true;

// ========================================
// 1. VERIFICAR ESTRUCTURA DE ARCHIVOS
// ========================================
console.log(`\n${colors.blue}📁 ESTRUCTURA DE ARCHIVOS${colors.reset}`);
console.log('-'.repeat(60));

const requiredFiles = [
  ['.env.local', 'Variables de entorno locales'],
  ['firestore.rules', 'Firestore Security Rules'],
  ['src/config/firebase.js', 'Configuración de Firebase'],
  ['src/pages/AdminView.jsx', 'Vista de Admin'],
  ['src/pages/PatientView.jsx', 'Vista de Paciente'],
  ['src/services/authService.js', 'Servicio de Auth'],
  ['src/components/AuditLog.jsx', 'Componente de Auditoría'],
];

requiredFiles.forEach(([file, desc]) => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  allGood = check(exists, `${desc}`, `${file}`) && allGood;
});

// ========================================
// 2. VERIFICAR VARIABLES DE ENTORNO
// ========================================
console.log(`\n${colors.blue}🔐 VARIABLES DE ENTORNO${colors.reset}`);
console.log('-'.repeat(60));

const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.log(`${colors.red}❌${colors.reset} .env.local no encontrado`);
  allGood = false;
}

if (envContent) {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_ARASAAC_API_URL',
    'VITE_APP_ENV',
  ];

  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    const varLine = envContent.split('\n').find(line => line.startsWith(varName + '='));
    const value = varLine ? varLine.split('=')[1] : '';
    const isValid = hasVar && value && value.length > 5 && !value.includes('tu_');
    allGood = check(isValid, `${varName}`, isValid ? 'Configurada ✓' : (value ? `Valor: ${value.substring(0, 20)}...` : 'Falta o vacía')) && allGood;
  });
}

// ========================================
// 3. VERIFICAR FIRESTORE RULES
// ========================================
console.log(`\n${colors.blue}🛡️ FIRESTORE SECURITY RULES${colors.reset}`);
console.log('-'.repeat(60));

const rulesPath = path.join(__dirname, '..', 'firestore.rules');
let rulesContent = '';

try {
  rulesContent = fs.readFileSync(rulesPath, 'utf8');
} catch (e) {
  console.log(`${colors.red}❌${colors.reset} firestore.rules no encontrado`);
  allGood = false;
}

if (rulesContent) {
  const checks = [
    ['match /users/{userId}', 'Reglas para usuarios'],
    ['match /organizations/{orgId}', 'Reglas para organizaciones'],
    ['isAdmin(orgId)', 'Función isAdmin definida'],
    ['isMember(orgId)', 'Función isMember definida'],
    ['allow read: if false', 'Denegación por defecto'],
  ];

  checks.forEach(([pattern, desc]) => {
    const exists = rulesContent.includes(pattern);
    allGood = check(exists, desc, pattern) && allGood;
  });
}

// ========================================
// 4. VERIFICAR CÓDIGO DE SEGURIDAD
// ========================================
console.log(`\n${colors.blue}🔒 CÓDIGO DE SEGURIDAD${colors.reset}`);
console.log('-'.repeat(60));

// Verificar App.jsx para AdminRoute
const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let appContent = '';

try {
  appContent = fs.readFileSync(appPath, 'utf8');
} catch (e) {
  console.log(`${colors.red}❌${colors.reset} App.jsx no encontrado`);
  allGood = false;
}

if (appContent) {
  const hasAdminRoute = appContent.includes('AdminRoute');
  const hasAuthGuard = appContent.includes('user ?') || appContent.includes('user &&');
  const hasLogout = appContent.includes('handleLogout') || appContent.includes('signOut');
  
  allGood = check(hasAdminRoute, 'AdminRoute implementada') && allGood;
  allGood = check(hasAuthGuard, 'Guard de autenticación implementada') && allGood;
  allGood = check(hasLogout, 'Logout implementada') && allGood;
}

// ========================================
// 5. VERIFICAR SERVICIOS
// ========================================
console.log(`\n${colors.blue}📦 SERVICIOS IMPLEMENTADOS${colors.reset}`);
console.log('-'.repeat(60));

const services = [
  'src/services/authService.js',
  'src/services/organizationService.js',
  'src/services/buttonService.js',
  'src/services/ttsService.js',
  'src/services/auditService.js',
];

services.forEach(service => {
  const fullPath = path.join(__dirname, '..', service);
  const exists = fs.existsSync(fullPath);
  const shortName = service.split('/').pop();
  allGood = check(exists, `${shortName}`, fullPath) && allGood;
});

// ========================================
// 6. VERIFICAR COMPONENTES UI
// ========================================
console.log(`\n${colors.blue}🎨 COMPONENTES DE UI${colors.reset}`);
console.log('-'.repeat(60));

const components = [
  ['src/components/Navbar.jsx', 'Navbar'],
  ['src/components/NotificationCenter.jsx', 'NotificationCenter'],
  ['src/components/AuditLog.jsx', 'AuditLog'],
  ['src/pages/EducationalDashboard.jsx', 'Panel Educativo'],
  ['src/pages/EducationalResources.jsx', 'Recursos Educativos'],
];

components.forEach(([file, name]) => {
  const fullPath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(fullPath);
  allGood = check(exists, `${name}`, file) && allGood;
});

// ========================================
// RESUMEN
// ========================================
console.log(`\n${'='.repeat(60)}`);

if (allGood) {
  console.log(`\n${colors.green}✅ ¡TODO ESTÁ BIEN!${colors.reset}`);
  console.log(`\n📋 Próximos pasos:`);
  console.log(`   1. Publicar firestore.rules en Firebase Console`);
  console.log(`   2. Configurar variables de entorno en producción`);
  console.log(`   3. Hacer deploy a Firebase Hosting\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}⚠️ HAY PROBLEMAS A RESOLVER${colors.reset}`);
  console.log(`\nFija los errores marcados con ❌ arriba\n`);
  process.exit(1);
}
