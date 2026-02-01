/**
 * Script de Auditoría de Usuarios
 * Verificar integridad de datos de seguridad
 * 
 * USO: node audit-users.js
 * 
 * ⚠️ Requiere:
 * - Credenciales de Firebase Admin SDK
 * - Archivo serviceAccountKey.json en scripts/
 */

// Este script requiere firebase-admin
// npm install firebase-admin

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar credenciales (debes obtenerlas de Firebase Console)
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: Falta archivo serviceAccountKey.json');
  console.log(`
Por favor:
1. Ve a: https://console.firebase.google.com/project/_/settings/serviceaccounts
2. Descarga JSON privado
3. Renómbralo a: serviceAccountKey.json
4. Colócalo en: scripts/
  `);
  process.exit(1);
}

const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
const serviceAccount = JSON.parse(serviceAccountData);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ============================================================
// AUDITORÍA
// ============================================================

async function auditUsers() {
  console.log('🔍 INICIANDO AUDITORÍA DE USUARIOS...\n');

  const issues = {
    warnings: [],
    errors: [],
    summary: {
      totalUsers: 0,
      admins: 0,
      especialistas: 0,
      miembros: 0,
      sinRol: 0,
      sinOrg: 0
    }
  };

  try {
    // Obtener todos los usuarios
    const usersSnapshot = await db.collection('users').get();
    
    issues.summary.totalUsers = usersSnapshot.size;
    
    console.log(`📊 Total de usuarios: ${usersSnapshot.size}\n`);
    console.log('Analizando cada usuario...\n');

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;

      console.log(`👤 Usuario: ${userData.email}`);
      console.log(`   UID: ${userId}`);
      console.log(`   Rol: ${userData.role || 'SIN ASIGNAR'}`);
      console.log(`   Org: ${userData.organizationId || 'SIN ORGANIZACIÓN'}`);

      // Validar rol
      const validRoles = ['admin', 'especialista', 'miembro', null];
      if (!validRoles.includes(userData.role)) {
        issues.errors.push({
          user: userData.email,
          severity: 'ERROR',
          message: `Rol inválido: "${userData.role}". Debe ser: admin, especialista, miembro`
        });
        console.log(`   ⚠️  PROBLEMA: Rol inválido`);
      }

      // Contar por rol
      if (userData.role === 'admin') issues.summary.admins++;
      if (userData.role === 'especialista') issues.summary.especialistas++;
      if (userData.role === 'miembro') issues.summary.miembros++;
      if (!userData.role) issues.summary.sinRol++;

      // Validar organización
      if (!userData.organizationId) {
        issues.warnings.push({
          user: userData.email,
          severity: 'WARNING',
          message: 'Usuario sin organización asignada'
        });
        issues.summary.sinOrg++;
        console.log(`   ⚠️  Sin organización`);
      } else {
        // Verificar que la organización existe
        const orgDoc = await db.collection('organizations').doc(userData.organizationId).get();
        if (!orgDoc.exists) {
          issues.errors.push({
            user: userData.email,
            severity: 'ERROR',
            message: `Organización ${userData.organizationId} no existe`
          });
          console.log(`   ⚠️  Organización no existe: ${userData.organizationId}`);
        }
      }

      // Validar email verificado
      if (!userData.emailVerified) {
        console.log(`   ⚠️  Email no verificado`);
      }

      console.log('');
    }

    // ============================================================
    // AUDITORÍA DE ORGANIZACIONES
    // ============================================================
    console.log('\n🏢 AUDITORÍA DE ORGANIZACIONES\n');
    
    const orgsSnapshot = await db.collection('organizations').get();
    
    for (const orgDoc of orgsSnapshot.docs) {
      const orgData = orgDoc.data();
      const orgId = orgDoc.id;
      
      // Contar miembros
      const membersSnapshot = await db
        .collection('organizations')
        .doc(orgId)
        .collection('members')
        .get();
      
      console.log(`🏢 ${orgData.name}`);
      console.log(`   ID: ${orgId}`);
      console.log(`   Miembros: ${membersSnapshot.size}`);
      
      // Verificar que hay al menos un admin
      const admins = membersSnapshot.docs.filter(m => m.data().role === 'admin');
      if (admins.length === 0) {
        issues.errors.push({
          organization: orgData.name,
          severity: 'ERROR',
          message: `Organización sin administrador`
        });
        console.log(`   ⚠️  ERROR: Sin administrador`);
      }
      
      console.log('');
    }

    // ============================================================
    // REPORTE
    // ============================================================
    console.log('\n\n📋 REPORTE DE AUDITORÍA\n');
    console.log('📊 RESUMEN:');
    console.log(`   Total usuarios: ${issues.summary.totalUsers}`);
    console.log(`   - Admins: ${issues.summary.admins}`);
    console.log(`   - Especialistas: ${issues.summary.especialistas}`);
    console.log(`   - Miembros: ${issues.summary.miembros}`);
    console.log(`   - Sin rol: ${issues.summary.sinRol}`);
    console.log(`   - Sin organización: ${issues.summary.sinOrg}`);

    if (issues.errors.length > 0) {
      console.log(`\n❌ ERRORES (${issues.errors.length}):`);
      issues.errors.forEach(err => {
        console.log(`   [${err.severity}] ${err.user || err.organization || 'DESCONOCIDO'}`);
        console.log(`   → ${err.message}`);
      });
    }

    if (issues.warnings.length > 0) {
      console.log(`\n⚠️  ADVERTENCIAS (${issues.warnings.length}):`);
      issues.warnings.forEach(warn => {
        console.log(`   [${warn.severity}] ${warn.user || warn.organization}`);
        console.log(`   → ${warn.message}`);
      });
    }

    if (issues.errors.length === 0 && issues.warnings.length === 0) {
      console.log('\n✅ No se encontraron problemas de seguridad');
    }

    // Guardar reporte
    const reportPath = path.join(__dirname, `audit-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`\n📁 Reporte guardado en: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error durante auditoría:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar auditoría
auditUsers();
