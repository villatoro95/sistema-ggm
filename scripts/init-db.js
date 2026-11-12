const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initDatabase() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const mysql = require('mysql2/promise');
  const rootConnection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  await rootConnection.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [process.env.DB_NAME || 'ccggm_academico']);
  await rootConnection.end();

  const pool = require('../config/db').pool;
  await pool.query(schema);
}

async function ensureAdminUser() {
  try {
    await initDatabase();
  } catch (error) {
    console.warn('No se pudo inicializar el esquema en esta ejecución:', error.message);
  }

  const existing = await db.query('SELECT id FROM users WHERE username = ? LIMIT 1', ['colegioCCGGM']);

  if (!existing.length) {
    const passwordHash = await bcrypt.hash('CCGGM01', 10);
    await db.execute(
      `INSERT INTO users (username, password_hash, role, full_name, must_change_password, status, created_at)
       VALUES (?, ?, 'admin', 'Administrador Principal', 1, 'active', NOW())`,
      ['colegioCCGGM', passwordHash]
    );
    console.log('Usuario administrador inicial creado: colegioCCGGM / CCGGM01');
  }
}

module.exports = { initDatabase, ensureAdminUser };
