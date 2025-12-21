import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'modfy_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const PRODUCTS_DIR = path.join(process.cwd(), 'storage', 'uploads', 'products');

function scanAllProductFolders() {
  const products: string[] = [];
  
  function scanDir(dir: string, basePath: string = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (!fs.statSync(fullPath).isDirectory()) continue;
      
      const images = fs.readdirSync(fullPath).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      
      if (images.length > 0) {
        products.push(basePath ? `${basePath}/${item}` : item);
      } else {
        scanDir(fullPath, basePath ? `${basePath}/${item}` : item);
      }
    }
  }
  
  scanDir(PRODUCTS_DIR);
  return products;
}

async function debugImageMatching() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n🔍 DEBUGGING IMAGE MATCHING\n');
    
    // Get all storage folders with images
    const storageFolders = scanAllProductFolders();
    console.log(`📁 Storage folders with images: ${storageFolders.length}`);
    storageFolders.forEach(f => console.log(`   - ${f}`));
    
    // Get all database products
    const [dbProducts] = await connection.execute(
      'SELECT id, name, images FROM products WHERE is_active = 1 ORDER BY name'
    );
    
    console.log(`\n📊 Database products: ${(dbProducts as any[]).length}`);
    console.log(`\n✅ Products WITH images:`);
    (dbProducts as any[])
      .filter(p => p.images && p.images !== '[]')
      .forEach(p => {
        const imgCount = JSON.parse(p.images).length;
        console.log(`   - ${p.name} (${imgCount} images)`);
      });
    
    console.log(`\n❌ Products WITHOUT images:`);
    (dbProducts as any[])
      .filter(p => !p.images || p.images === '[]')
      .forEach(p => console.log(`   - ${p.name}`));
    
    console.log(`\n🔗 MATCHING TEST:`);
    for (const dbProduct of dbProducts as any[]) {
      const productKey = dbProduct.name.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
      const matched = storageFolders.some(folder => {
        const folderName = folder.split('/').pop()?.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
        return folderName === productKey;
      });
      
      if (!matched && (!dbProduct.images || dbProduct.images === '[]')) {
        console.log(`   ⚠️  ${dbProduct.name} → No match found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

debugImageMatching();
