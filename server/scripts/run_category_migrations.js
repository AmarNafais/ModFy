import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Complex123',
    database: process.env.DB_NAME || 'modfy',
    multipleStatements: true
  };

  console.log('Attempting to connect to database...');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);

  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('✓ Connected to database successfully');

    // Run migration 0004
    const migration0004 = fs.readFileSync(
      path.join(__dirname, '../../migrations/0004_add_parent_category.sql'),
      'utf8'
    );
    
    console.log('Running migration 0004_add_parent_category...');
    await connection.query(migration0004);
    console.log('✓ Migration 0004 completed');

    // Run migration 0005
    const migration0005 = fs.readFileSync(
      path.join(__dirname, '../../migrations/0005_seed_categories.sql'),
      'utf8'
    );
    
    console.log('Running migration 0005_seed_categories...');
    await connection.query(migration0005);
    console.log('✓ Migration 0005 completed');

    // Run migration 0006
    const migration0006 = fs.readFileSync(
      path.join(__dirname, '../../migrations/0006_fix_category_structure.sql'),
      'utf8'
    );
    
    console.log('Running migration 0006_fix_category_structure...');
    await connection.query(migration0006);
    console.log('✓ Migration 0006 completed');

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔑 Database access denied. Please check your credentials.');
      console.error('Create a .env file in the root directory with:');
      console.error('DB_HOST=your_host');
      console.error('DB_USER=your_username');
      console.error('DB_PASSWORD=your_password');
      console.error('DB_NAME=your_database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💾 Database does not exist. Please create it first.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔌 Cannot connect to MySQL server. Is it running?');
    }
    throw error;
  } finally {
    await connection.end();
  }
}

runMigrations().catch(() => process.exit(1));
