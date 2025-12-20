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

async function updateProductImages() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   PRODUCT IMAGE UPDATE UTILITY        ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📁 Scanning storage folder structure...\n');
    const productMap = scanProductsFolder();
    console.log(`✅ Found ${Object.keys(productMap).length} product folders with images\n`);

    console.log('🔄 Matching database products with image folders...\n');
    
    const [dbProducts] = await connection.execute(
      'SELECT id, name FROM products WHERE is_active = 1'
    );
    
    let updated = 0;
    let normalized = 0;
    let failed = 0;

    // First pass: update products with images
    for (const dbProduct of dbProducts as any[]) {
      let match = null;
      const productName = dbProduct.name.toLowerCase()
        .replace(/[\s-_]+/g, ' ')
        .replace(/\(|\)/g, '')
        .replace(/v cut/gi, '')
        .trim();
      
      // Try to match with any folder that contains the product name
      for (const [folderKey, value] of Object.entries(productMap)) {
        const folderParts = folderKey.split('/').map(p => p.toLowerCase().trim());
        const productParts = productName.split(' ').filter(p => p.length > 2);
        
        // Check if folder path contains enough matching words from product name
        const matches = productParts.filter(part => 
          folderParts.some(fp => fp.includes(part) || part.includes(fp))
        );
        
        if (matches.length >= Math.min(2, productParts.length) || 
            folderKey.includes(productName) || 
            productName.includes(folderKey.split('/').pop() || '')) {
          match = value;
          break;
        }
      }
      
      if (match) {
        const { images, folder } = match;
        
        // Normalize paths to ensure consistent format
        const normalizedImages = images.map(img => {
          if (!img.startsWith('/storage/uploads/products/')) {
            return `/storage/uploads${img}`;
          }
          return img;
        });
        
        await connection.execute(
          'UPDATE products SET images = ? WHERE id = ?',
          [JSON.stringify(normalizedImages), dbProduct.id]
        );
        
        console.log(`✅ ${dbProduct.name}: ${normalizedImages.length} images`);
        updated++;
      }
    }

    // Second pass: normalize any existing paths
    console.log('\n🔧 Normalizing image paths in database...\n');
    
    const [allProducts] = await connection.execute(`
      SELECT id, name, images 
      FROM products 
      WHERE images IS NOT NULL AND images != '[]'
    `);
    
    for (const product of allProducts as any[]) {
      let images = JSON.parse(product.images);
      let hasIncorrect = false;
      let newImages = [];
      
      for (const imgPath of images) {
        let fixedPath = imgPath;
        
        if (!imgPath.startsWith('/')) {
          fixedPath = `/storage/uploads/${imgPath}`;
          hasIncorrect = true;
        }
        
        newImages.push(fixedPath);
      }
      
      if (hasIncorrect) {
        await connection.execute(
          'UPDATE products SET images = ? WHERE id = ?',
          [JSON.stringify(newImages), product.id]
        );
        normalized++;
      }
    }

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║            UPDATE SUMMARY             ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`📸 Products updated with images: ${updated}`);
    console.log(`🔧 Image paths normalized: ${normalized}`);
    console.log(`❌ Failed to update: ${failed}\n`);
    
    // Final verification
    const [withImages] = await connection.execute(`
      SELECT COUNT(*) as count FROM products 
      WHERE images IS NOT NULL AND images != '[]' AND is_active = 1
    `);
    
    const [totalImages] = await connection.execute(`
      SELECT SUM(JSON_LENGTH(images)) as total FROM products 
      WHERE images IS NOT NULL AND images != '[]' AND is_active = 1
    `);
    
    console.log(`📊 Final Status:`);
    console.log(`   • Active products with images: ${(withImages as any[])[0]?.count || 0}`);
    console.log(`   • Total images: ${(totalImages as any[])[0]?.total || 0}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

function scanProductsFolder() {
  const productMap: { [key: string]: { images: string[]; folder: string } } = {};
  
  function scanDir(dir: string, relativePath: string = '') {
    const items = fs.readdirSync(dir);
    
    const imageFiles = items.filter(f => {
      const fullPath = path.join(dir, f);
      return fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png|gif)$/i.test(f);
    });
    
    if (imageFiles.length > 0) {
      // Found a product folder with images
      const images = imageFiles.map(img => `/storage/uploads/products/${relativePath}/${img}`);
      
      // Use folder path as unique key to avoid collisions
      const folderKey = relativePath.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
      
      productMap[folderKey] = {
        images,
        folder: relativePath
      };
    }
    
    const folders = items.filter(f => {
      const fullPath = path.join(dir, f);
      return fs.statSync(fullPath).isDirectory();
    });
    
    for (const folder of folders) {
      const newPath = relativePath ? `${relativePath}/${folder}` : folder;
      scanDir(path.join(dir, folder), newPath);
    }
  }
  
  scanDir(PRODUCTS_DIR);
  return productMap;
}

updateProductImages();
