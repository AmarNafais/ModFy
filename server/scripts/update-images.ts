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

// Source directory (where product images are stored)
// Structure: storage/uploads/products/[category]/[subcategory]/[product-folder]/[images]
const UPLOADS_DIR = path.join(process.cwd(), 'storage', 'uploads', 'products');

// URL path prefix for accessing images
const PATH_PREFIX = '/storage/uploads/products';

// Helper function to sanitize folder names
function sanitizeFolderName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_()]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Helper function to ensure folder structure exists
async function ensureProductFolderStructure(connection: any) {
  console.log('🔧 Checking and creating folder structure...\n');
  
  // Get all products with their categories and subcategories
  const [products] = await connection.execute(`
    SELECT 
      p.id, 
      p.name,
      c.slug as category_slug,
      c.name as category_name,
      sc.slug as subcategory_slug,
      sc.name as subcategory_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN categories sc ON p.subcategory_id = sc.id
    WHERE p.is_active = 1
  `);
  
  let createdFolders = 0;
  let existingFolders = 0;
  
  for (const product of products as any[]) {
    if (!product.category_slug || !product.subcategory_slug) {
      console.log(`⚠️  Skipping ${product.name} - missing category or subcategory`);
      continue;
    }
    
    // Build folder path based on database structure
    const categoryFolder = product.category_slug; // e.g., 'boys', 'men', 'women'
    const subcategoryFolder = product.subcategory_slug; // e.g., 'pants', 'underwear', 'vest'
    const productFolder = sanitizeFolderName(product.name); // e.g., 'apple-v-cut'
    
    const fullPath = path.join(UPLOADS_DIR, categoryFolder, subcategoryFolder, productFolder);
    
    // Check if folder exists, create if not
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created: ${categoryFolder}/${subcategoryFolder}/${productFolder}`);
      createdFolders++;
    } else {
      existingFolders++;
    }
  }
  
  console.log(`\n📊 Folder Structure Status:`);
  console.log(`   • Existing folders: ${existingFolders}`);
  console.log(`   • Created folders: ${createdFolders}\n`);
}

async function updateProductImages() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   PRODUCT IMAGE UPDATE UTILITY        ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📁 Scanning uploads folder for product images...\n');

    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log(`⚠️  Uploads folder missing, creating: ${UPLOADS_DIR}`);
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // Ensure all product folders exist based on database
    await ensureProductFolderStructure(connection);

    console.log('📁 Reading image folder structure...\n');
    const productMap = scanProductsFolder();
    console.log(`✅ Found ${Object.keys(productMap).length} product folders with images\n`);

    // Get all active products from database for cleanup
    const [activeProducts] = await connection.execute(`
      SELECT 
        p.id,
        p.name,
        c.slug as category_slug,
        sc.slug as subcategory_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories sc ON p.subcategory_id = sc.id
      WHERE p.is_active = 1
    `);
    
    const validProductFolders = new Set<string>();
    const productNamesMap = new Map<string, string>(); // Map folder path to product name for logging
    
    for (const product of activeProducts as any[]) {
      if (product.category_slug && product.subcategory_slug) {
        const productFolder = sanitizeFolderName(product.name);
        const relativePath = `${product.category_slug}/${product.subcategory_slug}/${productFolder}`;
        const normalizedPath = relativePath.toLowerCase();
        validProductFolders.add(normalizedPath);
        productNamesMap.set(normalizedPath, product.name);
      }
    }
    
    console.log(`📋 Active products in database: ${validProductFolders.size}`);

    console.log('🔄 Matching database products with image folders...\n');
    
    const [dbProducts] = await connection.execute(
      'SELECT id, name FROM products WHERE is_active = 1'
    );
    
    let updated = 0;
    let normalized = 0;
    let failed = 0;
    const usedFolders = new Set<string>();

    // First pass: update products with images
    for (const dbProduct of dbProducts as any[]) {
      let match = null;
      let bestScore = 0;
      let bestFolderKey = '';
      
      const productName = dbProduct.name.toLowerCase()
        .replace(/[\s-_]+/g, ' ')
        .replace(/\(|\)/g, '')
        .trim();
      
      // Try to find the best matching folder
      for (const [folderKey, value] of Object.entries(productMap)) {
        // Skip if this folder was already matched to another product
        if (usedFolders.has(folderKey)) continue;
        
        const folderPath = value.folder.toLowerCase();
        const folderName = folderPath.split('/').pop() || '';
        const category = folderPath.split('/')[0] || '';
        
        // Normalize folder name for comparison
        const normalizedFolderName = folderName.replace(/[\s-_\(\)]+/g, ' ').trim();
        
        let score = 0;
        
        // Exact match bonus (after normalization)
        if (normalizedFolderName === productName) {
          score += 100;
        }
        
        // Very close match (contains all words)
        const pWords = productName.split(' ').filter((w: string) => w.length > 2);
        const fWords = normalizedFolderName.split(' ').filter((w: string) => w.length > 2);
        const matchedWords = pWords.filter(pw => fWords.some(fw => fw.includes(pw) || pw.includes(fw)));
        if (matchedWords.length === pWords.length && matchedWords.length > 0) {
          score += 80;
        }
        
        // Category match bonus
        if (productName.includes('boys') && category === 'boys') score += 25;
        if (productName.includes('girls') && category === 'girls') score += 25;
        if (productName.includes('mens') || productName.includes('cantex mens')) {
          if (category === 'men') score += 25;
        }
        if ((productName.includes('women') || (!productName.includes('boys') && !productName.includes('girls') && !productName.includes('mens') && (productName.includes('panties') || productName.includes('feyolina')))) && category === 'women') {
          score += 25;
        }
        if (productName.includes('cantex') && folderPath.includes('cantex')) score += 20;
        
        // Product type match (vest, panties, pants, underwear, etc)
        const productWords = productName.split(' ').filter((w: string) => w.length > 3);
        const folderWords = folderPath.replace(/[\s-_/]+/g, ' ').split(' ').filter((w: string) => w.length > 3);
        
        let wordMatches = 0;
        for (const word of productWords) {
          if (folderWords.includes(word)) {
            wordMatches++;
            score += 15;
          }
        }
        
        // Specific product matches with category context
        if (productName.includes('feyolina')) {
          if (productName.includes('girls') && folderPath.includes('girls/vest')) score += 40;
          else if (productName.includes('vest') && !productName.includes('girls') && folderPath.includes('women/vest')) score += 40;
          else if (productName.includes('panties') && folderPath.includes('women/panties')) score += 40;
        }
        
        if (productName.includes('petticoat')) {
          if (productName.includes('girls') && folderPath.includes('girls/vest')) score += 40;
          else if (!productName.includes('girls') && folderPath.includes('women/vest')) score += 40;
        }
        
        if (productName.includes('shorty')) {
          if (folderPath.includes('girls') && productName.includes('shorty panties')) score += 40;
          else if (folderPath.includes('women/panties') && !productName.includes('girls')) score += 40;
        }
        
        // Update if this is the best match so far
        if (score > bestScore && score >= 20) {
          bestScore = score;
          match = value;
          bestFolderKey = folderKey;
        }
      }
      
      if (match) {
        const { images, folder } = match;
        
        // Mark this folder as used
        usedFolders.add(bestFolderKey);
        
        // Normalize paths to ensure consistent format
        const normalizedImages = images.map(img => {
          // Ensure paths are rooted at PATH_PREFIX
          if (!img.startsWith(PATH_PREFIX + '/')) {
            const cleaned = img.replace(/^\/storage\/uploads\/products\//, '').replace(/^\/storage\/uploads\//, '').replace(/^\/storage\//, '').replace(/^uploads\//, '');
            return `${PATH_PREFIX}/${cleaned.replace(/^\/+/, '')}`;
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
          fixedPath = `${PATH_PREFIX}/${imgPath}`;
          hasIncorrect = true;
        }

        if (!fixedPath.startsWith(PATH_PREFIX + '/')) {
          // Normalize any prior storage roots
          fixedPath = `${PATH_PREFIX}/${fixedPath
            .replace(/^\/storage\/uploads\/products\//, '')
            .replace(/^\/storage\/products\//, '')
            .replace(/^\/storage\/uploads\//, '')
            .replace(/^\/storage\//, '')
            .replace(/^uploads\//, '')
            .replace(/^\/+/, '')}`;
          hasIncorrect = true;
        }
        
        // Keep original casing for file paths (don't lowercase)
        const pathParts = fixedPath.split('/');
        const normalizedPath = pathParts.map((part, idx) => {
          // Keep /storage/uploads as-is, preserve casing for category/subcategory/product folders
          if (idx <= 2) return part;
          return part;
        }).join('/');
        
        if (normalizedPath !== fixedPath) {
          hasIncorrect = true;
        }
        
        newImages.push(normalizedPath);
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
    
    // Cleanup orphaned folders (folders without matching products in database)
    console.log('\n🗑️  Cleaning up orphaned folders...\n');
    console.log(`📋 Valid product folders in database: ${validProductFolders.size}`);
    console.log(`📁 Scanned folders on disk: ${Object.keys(productMap).length}\n`);
    
    let removedFolders = 0;
    let checkedFolders = 0;
    
    for (const [folderKey, value] of Object.entries(productMap)) {
      // Normalize folder path for comparison
      const normalizedFolderPath = value.folder.toLowerCase();
      checkedFolders++;
      
      // Check if this folder corresponds to an active product
      const isValid = validProductFolders.has(normalizedFolderPath);
      
      if (!isValid) {
        const fullPath = path.join(UPLOADS_DIR, value.folder);
        
        console.log(`❌ Orphaned folder detected: ${value.folder}`);
        console.log(`   Path: ${normalizedFolderPath}`);
        console.log(`   Not matching any product in database`);
        
        try {
          if (fs.existsSync(fullPath)) {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`   🗑️  Removed successfully\n`);
            removedFolders++;
          }
        } catch (error) {
          console.error(`   ❌ Failed to remove:`, error);
        }
      }
    }
    
    if (removedFolders > 0) {
      console.log(`\n✅ Removed ${removedFolders} orphaned folder(s)\n`);
    } else {
      console.log(`✅ No orphaned folders found\n`);
    }
    
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
    
    // Verify folder structure integrity
    console.log('🔍 Verifying folder structure integrity...\n');
    await verifyFolderStructure(connection);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

async function verifyFolderStructure(connection: any) {
  const [products] = await connection.execute(`
    SELECT 
      p.id, 
      p.name,
      c.slug as category_slug,
      sc.slug as subcategory_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN categories sc ON p.subcategory_id = sc.id
    WHERE p.is_active = 1
  `);
  
  let missingFolders = 0;
  let validFolders = 0;
  
  for (const product of products as any[]) {
    if (!product.category_slug || !product.subcategory_slug) continue;
    
    const categoryFolder = product.category_slug;
    const subcategoryFolder = product.subcategory_slug;
    const productFolder = sanitizeFolderName(product.name);
    
    const fullPath = path.join(UPLOADS_DIR, categoryFolder, subcategoryFolder, productFolder);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Missing folder: ${categoryFolder}/${subcategoryFolder}/${productFolder}`);
      missingFolders++;
    } else {
      validFolders++;
    }
  }
  
  console.log(`📊 Structure Verification:`);
  console.log(`   • Valid folders: ${validFolders}`);
  console.log(`   • Missing folders: ${missingFolders}`);
  if (missingFolders === 0) {
    console.log(`   ✅ All product folders exist!\n`);
  } else {
    console.log(`   ⚠️  Run script again to create missing folders\n`);
  }
}

function scanProductsFolder() {
  const productMap: { [key: string]: { images: string[]; folder: string } } = {};
  
  function scanDir(dir: string, relativePath: string = '') {
    const items = fs.readdirSync(dir);
    
    const imageFiles = items.filter(f => {
      const fullPath = path.join(dir, f);
      return fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png|gif|heic|webp)$/i.test(f);
    });
    
    if (imageFiles.length > 0) {
      // Found a product folder with images
      // Keep original path structure (no lowercase conversion to preserve actual file paths)
      const images = imageFiles.map(img => `${PATH_PREFIX}/${relativePath}/${img}`);
      
      // Use folder path as unique key to avoid collisions
      const folderKey = relativePath.toLowerCase().replace(/[\s-_]+/g, ' ').trim();
      
      productMap[folderKey] = {
        images,
        folder: relativePath
      };
    }
    
    const folders = items.filter(f => {
      const fullPath = path.join(dir, f);
      // Don't skip any folders - we want all subdirectories
      return fs.statSync(fullPath).isDirectory();
    });
    
    for (const folder of folders) {
      const newPath = relativePath ? `${relativePath}/${folder}` : folder;
      scanDir(path.join(dir, folder), newPath);
    }
  }
  
  scanDir(UPLOADS_DIR);
  return productMap;
}

updateProductImages();
