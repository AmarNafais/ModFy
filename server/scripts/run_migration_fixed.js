#!/usr/bin/env node
// Simple migration runner: node server/scripts/run_migration_fixed.js <relative-path-to-sql-file>
// Uses DB_* env vars or fallback defaults from dbStorage.
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function run() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node server/scripts/run_migration_fixed.js <migrations/0001_file.sql>');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  // Split the SQL file by the statement breakpoint and filter out empty statements
  const statements = sql
    .split('--> statement-breakpoint')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'Complex123';
  const database = process.env.DB_NAME || 'modfy';

  console.log(`Connecting to ${user}@${host}/${database} ...`);

  const conn = await mysql.createConnection({ host, user, password, database });
  try {
    console.log('Running migration file:', sqlPath);
    
    // Execute each statement separately
    for (const statement of statements) {
      console.log('\nExecuting statement:', statement.substring(0, 100) + '...');
      const [results] = await conn.query(statement);
      console.log('Statement executed successfully');
    }
    
    console.log('\nMigration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(2);
  } finally {
    await conn.end();
  }
}

run();