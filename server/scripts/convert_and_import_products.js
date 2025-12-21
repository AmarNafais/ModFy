import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const execPromise = promisify(exec);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'modfy_store',
};

// Product folder structure
const PRODUCTS_BASE_PATH = 'c:\\Users\\nabee\\Desktop\\Amar Projects\\ModFy\\storage\\uploads\\products';
const OUTPUT_BASE_PATH = 'c:\\Users\\nabee\\Desktop\\Amar Projects\\ModFy\\storage\\uploads\\products';

// Category mappings based on folder structure
const CATEGORY_MAPPINGS = {
  'Boys': {
    main: 'KIDS',
    sub: 'Boys',
    products: {
      'Cantex Junior Boxer': 'Cantex Junior Boxer',
      'Junior Brief': 'Junior Brief',
      'Pants': {
        'Balloon Pocket Short': 'Boys Balloon Pocket Short',
        'Cargo Pants': 'Boys Cargo Pants',
      },
      'Vest - Boys': {
        'With Sleeve': 'Boys Vest With Sleeve',
        'Without Sleeve': 'Boys Vest Without Sleeve',
      }
    }
  },
  'Girls': {
    main: 'KIDS',
    sub: 'Girls',
    products: {
      'Panties - Girls': {
        'Lace School Panties': 'Girls Lace School Panties',
        'Scallop School Panties': 'Girls Scallop School Panties',
        'Shorty Panties': 'Girls Shorty Panties',
      },
      'Vest - Girls': {
        'Feyolina': 'Girls Feyolina Vest',
        'Petticoat': 'Girls Petticoat',
      }
    }
  },
  'Mens': {
    main: 'MEN',
    sub: null,
    products: {
      'Pants': {
        'Balloon Pocket Shorts': 'Men Balloon Pocket Shorts',
        'Slim Shorts': 'Men Slim Shorts',
      },
      'T Shirts': {
        // Folder structure suggests T-shirts products
      },
      'Ultimate': 'Men Ultimate Underwear',
      'Underwear': {
        'Apple': 'Men Apple Underwear',
        'Classic': 'Men Classic Underwear',
        'Long boxer': 'Men Long Boxer',
        'Short Boxer': 'Men Short Boxer',
      },
      'Vest': {
        'With Sleeve': 'Men Vest With Sleeve',
        'Without Sleeve': 'Men Vest Without Sleeve',
      }
    }
  },
  'Women': {
    main: 'WOMEN',
    sub: null,
    products: {
      'Panties - Women': {
        'Dark Printed': 'Women Dark Printed Panties',
        'Feyolina': 'Women Feyolina Panties',
        'Fit Shorts': 'Women Fit Shorts',
        'Plain Light Colour': 'Women Plain Light Colour Panties',
        'Shorty': 'Women Shorty Panties',
      },
      'Vest - Women': {
        'Feyolina': 'Women Feyolina Vest',
        'Petticoat': 'Women Petticoat',
      }
    }
  }
};

// Case-insensitive access to category mappings
const CATEGORY_MAPPINGS_LOWER = Object.fromEntries(
  Object.entries(CATEGORY_MAPPINGS).map(([k, v]) => [k.toLowerCase(), v])
);

/**
 * Recursively scan directory for image files
 */
async function scanDirectory(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await scanDirectory(fullPath, baseDir);
      files.push(...subFiles);
    } else {
      const ext = extname(entry.name).toLowerCase();
      if (['.heic', '.jpg', '.jpeg', '.png'].includes(ext)) {
        // Get relative path from base directory
        const relativePath = fullPath.replace(baseDir, '').replace(/\\/g, '/').replace(/^\//, '');
        files.push({
          fullPath,
          relativePath,
          name: entry.name,
          ext,
        });
      }
    }
  }

  return files;
}

/**
 * Convert HEIC to PNG using ImageMagick
 * Note: Requires ImageMagick to be installed
 */
async function convertHeicToPng(inputPath, outputPath) {
  try {
    // Ensure output directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    // Using magick (ImageMagick 7) or convert (ImageMagick 6)
    // Try magick first (Windows ImageMagick 7)
    try {
      await execPromise(`magick "${inputPath}" "${outputPath}"`);
      console.log(`✓ Converted: ${basename(inputPath)} → ${basename(outputPath)}`);
      return outputPath;
    } catch (e) {
      // Try convert command (ImageMagick 6 or alternative)
      await execPromise(`convert "${inputPath}" "${outputPath}"`);
      console.log(`✓ Converted: ${basename(inputPath)} → ${basename(outputPath)}`);
      return outputPath;
    }
  } catch (error) {
    console.error(`✗ Failed to convert ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Copy or convert image to output directory
 */
async function processImage(file, outputBasePath) {
  const outputFileName = file.ext.toLowerCase() === '.heic' 
    ? file.name.replace(/\.heic$/i, '.png')
    : file.name;
  
  const outputPath = join(outputBasePath, dirname(file.relativePath), outputFileName);

  if (file.ext.toLowerCase() === '.heic') {
    return await convertHeicToPng(file.fullPath, outputPath);
  } else {
    // Copy existing JPG/PNG files
    try {
      await mkdir(dirname(outputPath), { recursive: true });
      await execPromise(`copy "${file.fullPath}" "${outputPath}"`);
      console.log(`✓ Copied: ${file.name}`);
      return outputPath;
    } catch (error) {
      console.error(`✗ Failed to copy ${file.fullPath}:`, error.message);
      return null;
    }
  }
}

/**
 * Parse product information from folder structure
 */
function parseProductFromPath(relativePath) {
  const parts = relativePath.split('/').filter(p => p);
  
  // Structure: [Gender]/[Category]/[ProductType]/[image.ext]
  // or: [Gender]/[Category]/[image.ext]
  
  if (parts.length < 2) return null;
  // Normalize gender for robust folder casing (e.g., boys -> Boys)
  const genderRaw = parts[0];
  const genderLower = genderRaw.toLowerCase();
  const gender = genderLower.charAt(0).toUpperCase() + genderLower.slice(1);
  const category = parts[1]; // e.g., "Underwear", "Pants", "Panties - Women"
  
  let productType = null;
  if (parts.length >= 3 && !parts[parts.length - 1].match(/\.(jpg|jpeg|png|heic)$/i)) {
    productType = parts[parts.length - 2]; // e.g., "Apple", "Short Boxer"
  } else if (parts.length >= 4) {
    productType = parts[2]; // e.g., "Apple", "Short Boxer"
  }

  return {
    gender,
    category,
    productType,
    // Use lowercased lookup to support lowercase folder names
    mainCategory: CATEGORY_MAPPINGS_LOWER[genderLower]?.main,
    subCategory: CATEGORY_MAPPINGS_LOWER[genderLower]?.sub,
  };
}

/**
 * Generate slug from product name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Group images by product
 */
function groupImagesByProduct(files, outputBasePath) {
  const products = {};

  for (const file of files) {
    const productInfo = parseProductFromPath(file.relativePath);
    if (!productInfo) continue;

    // Create unique product key
    const productKey = [
      productInfo.gender,
      productInfo.category,
      productInfo.productType
    ].filter(Boolean).join('__');

    if (!products[productKey]) {
      products[productKey] = {
        ...productInfo,
        images: [],
        folderPath: dirname(file.relativePath),
      };
    }

    // Store relative path from uploads folder
    const relativeOutputPath = join(
      'products',
      dirname(file.relativePath),
      file.ext.toLowerCase() === '.heic' ? file.name.replace(/\.heic$/i, '.png') : file.name
    ).replace(/\\/g, '/');

    products[productKey].images.push(relativeOutputPath);
  }

  return products;
}

/**
 * Get or create category in database
 */
async function getOrCreateCategory(connection, name, parentId = null) {
  const slug = generateSlug(name);
  
  // Check if category exists
  const [existing] = await connection.query(
    'SELECT id FROM categories WHERE slug = ? LIMIT 1',
    [slug]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new category
  const [result] = await connection.query(
    `INSERT INTO categories (id, name, slug, parent_id, is_active) 
     VALUES (UUID(), ?, ?, ?, true)`,
    [name, slug, parentId]
  );

  // Get the created category ID
  const [newCategory] = await connection.query(
    'SELECT id FROM categories WHERE slug = ? LIMIT 1',
    [slug]
  );

  console.log(`✓ Created category: ${name} (${slug})`);
  return newCategory[0].id;
}

/**
 * Insert or update product in database
 */
async function insertProduct(connection, productData) {
  const slug = generateSlug(productData.name);

  // Check if product exists
  const [existing] = await connection.query(
    'SELECT id FROM products WHERE slug = ? LIMIT 1',
    [slug]
  );

  const imagesJson = JSON.stringify(productData.images);

  if (existing.length > 0) {
    // Update existing product
    await connection.query(
      `UPDATE products 
       SET name = ?, description = ?, category_id = ?, subcategory_id = ?, 
           images = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        productData.name,
        productData.description,
        productData.categoryId,
        productData.subcategoryId,
        imagesJson,
        existing[0].id
      ]
    );
    console.log(`✓ Updated product: ${productData.name}`);
    return existing[0].id;
  } else {
    // Insert new product
    await connection.query(
      `INSERT INTO products 
       (id, name, slug, description, price, category_id, subcategory_id, images, 
        is_active, stock_quantity) 
       VALUES (UUID(), ?, ?, ?, 0.00, ?, ?, ?, true, 0)`,
      [
        productData.name,
        slug,
        productData.description,
        productData.categoryId,
        productData.subcategoryId,
        imagesJson
      ]
    );
    console.log(`✓ Created product: ${productData.name}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('=== Product Image Converter & Importer ===\n');

  // Step 1: Scan for images
  console.log('Step 1: Scanning for images...');
  const files = await scanDirectory(PRODUCTS_BASE_PATH);
  console.log(`Found ${files.length} image files\n`);

  // Step 2: Convert HEIC to PNG
  console.log('Step 2: Converting HEIC images to PNG...');
  const heicFiles = files.filter(f => f.ext.toLowerCase() === '.heic');
  console.log(`${heicFiles.length} HEIC files need conversion\n`);

  if (heicFiles.length > 0) {
    console.log('Note: This requires ImageMagick to be installed.');
    console.log('Install from: https://imagemagick.org/script/download.php\n');
    
    for (const file of heicFiles) {
      await processImage(file, OUTPUT_BASE_PATH);
    }
  }

  // Step 3: Copy other image formats
  console.log('\nStep 3: Copying JPG/PNG images...');
  const otherFiles = files.filter(f => f.ext.toLowerCase() !== '.heic');
  for (const file of otherFiles) {
    await processImage(file, OUTPUT_BASE_PATH);
  }

  // Step 4: Group images by product
  console.log('\nStep 4: Grouping images by product...');
  const products = groupImagesByProduct(files, OUTPUT_BASE_PATH);
  console.log(`Identified ${Object.keys(products).length} products\n`);

  // Step 5: Connect to database and import
  console.log('Step 5: Importing to database...');
  const connection = await mysql.createConnection(dbConfig);

  try {
    for (const [key, product] of Object.entries(products)) {
      // Get or create main category
      let categoryId = null;
      if (product.mainCategory) {
        categoryId = await getOrCreateCategory(connection, product.mainCategory);
      }

      // Get or create subcategory
      let subcategoryId = null;
      if (product.subCategory && categoryId) {
        subcategoryId = await getOrCreateCategory(
          connection, 
          product.subCategory, 
          categoryId
        );
      }

      // Generate product name
      const productName = [
        product.gender,
        product.category,
        product.productType
      ].filter(Boolean).join(' ');

      // Insert product
      await insertProduct(connection, {
        name: productName,
        description: `${productName} - Available in multiple colors and sizes`,
        categoryId,
        subcategoryId,
        images: product.images,
      });
    }

    console.log('\n✓ Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await connection.end();
  }

  console.log('\n=== Summary ===');
  console.log(`Total images processed: ${files.length}`);
  console.log(`HEIC converted: ${heicFiles.length}`);
  console.log(`Products created/updated: ${Object.keys(products).length}`);
  console.log('\nImages saved to:', OUTPUT_BASE_PATH);
}

// Run the script
main().catch(console.error);
