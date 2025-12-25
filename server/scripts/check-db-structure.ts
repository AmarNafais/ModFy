import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDB() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'modfy_store'
  });
  
  const conn = await pool.getConnection();
  
  try {
    console.log('\n=== CATEGORIES ===\n');
    const [cats] = await conn.execute('SELECT id, name, slug, parent_id FROM categories ORDER BY parent_id, name LIMIT 30');
    (cats as any[]).forEach(c => console.log(`  ${c.name} (parent: ${c.parent_id || 'ROOT'}) - slug: ${c.slug}`));
    
    console.log('\n\n=== PRODUCTS (sample) ===\n');
    const [prods] = await conn.execute('SELECT id, name, category_id, subcategory_id FROM products LIMIT 20');
    (prods as any[]).forEach(p => console.log(`  ${p.name} (cat: ${p.category_id}, sub: ${p.subcategory_id})`));
    
    console.log('\n\n=== CATEGORY SLUGS VS FOLDER NAMES ===\n');
    const [mainCats] = await conn.execute('SELECT name, slug FROM categories WHERE parent_id IS NULL');
    console.log('Main categories:');
    (mainCats as any[]).forEach(c => console.log(`  ${c.name} -> ${c.slug}`));
    
  } finally {
    conn.release();
    await pool.end();
  }
}

checkDB();
