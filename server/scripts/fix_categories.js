import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixCategories() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Complex123',
    database: process.env.DB_NAME || 'modfy',
    multipleStatements: true
  };

  console.log('Attempting to connect to database...');
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('✓ Connected to database successfully');

    // Run migration 0006 to fix category structure
    const migration0006 = fs.readFileSync(
      path.join(__dirname, '../../migrations/0006_fix_category_structure.sql'),
      'utf8'
    );
    
    console.log('Fixing category structure...');
    await connection.query(migration0006);
    console.log('✓ Categories updated successfully');

    console.log('\n✅ Category structure fixed!');
    console.log('Main categories: MEN, WOMEN, BOYS, GIRLS, UNISEX');
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixCategories().catch(() => process.exit(1));
