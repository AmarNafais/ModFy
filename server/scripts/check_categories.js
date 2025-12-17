import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function checkCategories() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Complex123',
    database: process.env.DB_NAME || 'modfy',
  });

  try {
    console.log('Checking categories in database...\n');

    // Check main categories
    const [mainCats] = await connection.query(
      'SELECT id, name, slug, parent_id FROM categories WHERE parent_id IS NULL ORDER BY name'
    );
    console.log('Main Categories (parent_id IS NULL):');
    console.table(mainCats);

    // Check all categories
    const [allCats] = await connection.query(
      'SELECT id, name, slug, parent_id FROM categories ORDER BY parent_id, name'
    );
    console.log('\nAll Categories:');
    console.table(allCats);

  } finally {
    await connection.end();
  }
}

checkCategories().catch(console.error);
