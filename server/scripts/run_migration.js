#!/usr/bin/env node
// Simple migration runner: node server/scripts/run_migration.js <relative-path-to-sql-file>
// Uses DB_* env vars or fallback defaults from dbStorage.
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function run() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node server/scripts/run_migration.js <migrations/0001_file.sql>');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'Complex123';
  const database = process.env.DB_NAME || 'modfy';

  console.log(`Connecting to ${user}@${host}/${database} ...`);

  const conn = await mysql.createConnection({ host, user, password, database, multipleStatements: true });
  try {
    console.log('Running migration file:', sqlPath);
    const [results] = await conn.query(sql);
    console.log('Migration executed successfully. Results:', results);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(2);
  } finally {
    await conn.end();
  }
}

run();
