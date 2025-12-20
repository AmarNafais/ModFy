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
      const productKey = dbProduct.name.toLowerCase()
        .replace(/[\s-_]+/g, ' ')
        .replace(/\(|\)/g, '')  // Remove parentheses
        .replace(/v cut/gi, '')  // Remove "V Cut" suffix
        .trim();
      
      // Try exact match first
      let match = productMap[productKey];
      
      // If no exact match, try fuzzy matching
      if (!match) {
        for (const [key, value] of Object.entries(productMap)) {
          const cleanKey = key.replace(/v cut/gi, '').trim();
          const cleanProductKey = productKey.replace(/v cut/gi, '').trim();
          
          if (cleanKey === cleanProductKey || 
              cleanKey.includes(cleanProductKey) || 
              cleanProductKey.includes(cleanKey)) {
            match = value;
            break;
          }
        }
      }
      
      if (match) {
        const { images } = match;
        
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
  
  const categories = fs.readdirSync(PRODUCTS_DIR);
  
  for (const category of categories) {
    const categoryPath = path.join(PRODUCTS_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    try {
      const subcategories = fs.readdirSync(categoryPath);
      
      for (const subcategory of subcategories) {
        const subcategoryPath = path.join(categoryPath, subcategory);
        if (!fs.statSync(subcategoryPath).isDirectory()) continue;
        
        // Check if this folder directly contains images (2-level: Category/Product)
        const directImages = fs.readdirSync(subcategoryPath)
          .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
        
        if (directImages.length > 0) {
          // This is a product folder directly under category
          const images = directImages.map(img => 
            `/storage/uploads/products/${category}/${subcategory}/${img}`
          );
          const productKey = subcategory.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
          productMap[productKey] = {
            images,
            folder: `${category}/${subcategory}`
          };
        } else {
          // This is a subcategory folder, scan for products (3-level: Category/Subcategory/Product)
          try {
            const products = fs.readdirSync(subcategoryPath);
            
            for (const product of products) {
              const productPath = path.join(subcategoryPath, product);
              if (!fs.statSync(productPath).isDirectory()) continue;
              
              const images = fs.readdirSync(productPath)
                .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
                .map(img => `/storage/uploads/products/${category}/${subcategory}/${product}/${img}`);
              
              if (images.length > 0) {
                const productKey = product.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
                productMap[productKey] = {
                  images,
                  folder: `${category}/${subcategory}/${product}`
                };
              }
            }
          } catch (e) {
            // Skip if error reading products
          }
        }
      }
    } catch (e) {
      // Skip categories with errors
    }
  }
  
  return productMap;
}

updateProductImages();
