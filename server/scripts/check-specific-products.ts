import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkProducts() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'modfy_store'
  });
  
  const conn = await pool.getConnection();
  
  try {
    const names = ['Apple V Cut', 'Classic V Cut', 'Fit Shorts (Black)', 'Fit Shorts (White)', 'Ultimate V Cut'];
    
    for (const name of names) {
      const [rows] = await conn.execute('SELECT id, name, images FROM products WHERE name = ?', [name]);
      
      if ((rows as any[]).length > 0) {
        const p = (rows as any[])[0];
        console.log(`\n${p.name}:`);
        console.log(`  Images: ${p.images || 'NULL'}`);
      } else {
        console.log(`\n${name}: NOT FOUND IN DATABASE`);
      }
    }
    
  } finally {
    conn.release();
    await pool.end();
  }
}

checkProducts();
