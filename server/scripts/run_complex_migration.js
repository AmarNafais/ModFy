#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function run() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node server/scripts/run_complex_migration.js <migrations/0001_file.sql>');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Split SQL into individual statements, excluding comments
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => {
      // Remove comment lines and empty statements
      const lines = stmt.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('/*');
      });
      return lines.length > 0;
    });

  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'Complex123';
  const database = process.env.DB_NAME || 'modfy';

  console.log(`Connecting to ${user}@${host}/${database} ...`);

  const conn = await mysql.createConnection({ 
    host, 
    user, 
    password, 
    database,
    multipleStatements: false // We'll handle statements one by one
  });

  try {
    console.log('Running migration file:', sqlPath);
    
    // Execute each statement separately
    for (const statement of statements) {
      if (!statement) continue;
      
      console.log('\nExecuting statement:', statement.substring(0, 200) + '...');
      try {
        await conn.query(statement);
        console.log('Statement executed successfully');
      } catch (err) {
        console.error('Error executing statement:', err);
        throw err;
      }
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