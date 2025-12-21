import { readdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';

// Product folder structure
const PRODUCTS_BASE_PATH = 'c:\\Users\\nabee\\Desktop\\Amar Projects\\ModFy\\storage\\uploads\\products';

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
 * Group images by product folder
 */
function groupImagesByProduct(files) {
  const products = {};

  for (const file of files) {
    const parts = file.relativePath.split('/').filter(p => p);
    
    if (parts.length < 2) continue;

    const folderPath = dirname(file.relativePath);
    
    if (!products[folderPath]) {
      products[folderPath] = {
        gender: parts[0],
        category: parts[1],
        productType: parts.length >= 3 ? parts[parts.length - 2] : null,
        folderPath: folderPath,
        images: [],
        heicCount: 0,
        jpgCount: 0,
      };
    }

    products[folderPath].images.push(file.name);
    
    if (file.ext.toLowerCase() === '.heic') {
      products[folderPath].heicCount++;
    } else {
      products[folderPath].jpgCount++;
    }
  }

  return products;
}

/**
 * Main execution function
 */
async function main() {
  console.log('=== Product Image Analysis ===\n');
  console.log('Scanning Products folder...\n');

  const files = await scanDirectory(PRODUCTS_BASE_PATH);
  const products = groupImagesByProduct(files);

  console.log(`📊 SUMMARY`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Total image files: ${files.length}`);
  console.log(`HEIC files: ${files.filter(f => f.ext === '.heic').length}`);
  console.log(`JPG files: ${files.filter(f => f.ext.match(/\.jpe?g$/i)).length}`);
  console.log(`PNG files: ${files.filter(f => f.ext === '.png').length}`);
  console.log(`Unique products: ${Object.keys(products).length}\n`);

  console.log(`📁 PRODUCT BREAKDOWN`);
  console.log(`${'='.repeat(80)}\n`);

  // Group by gender
  const byGender = {};
  for (const [path, product] of Object.entries(products)) {
    if (!byGender[product.gender]) {
      byGender[product.gender] = [];
    }
    byGender[product.gender].push({ path, ...product });
  }

  for (const [gender, items] of Object.entries(byGender)) {
    console.log(`\n🏷️  ${gender.toUpperCase()}`);
    console.log(`${'-'.repeat(80)}`);
    
    items.forEach(item => {
      const productName = [item.category, item.productType].filter(Boolean).join(' > ');
      console.log(`\n   ${productName}`);
      console.log(`   📂 ${item.folderPath}`);
      console.log(`   📷 Images: ${item.images.length} (${item.heicCount} HEIC, ${item.jpgCount} JPG/PNG)`);
      console.log(`   Files: ${item.images.slice(0, 3).join(', ')}${item.images.length > 3 ? '...' : ''}`);
    });
  }

  console.log('\n\n📋 PRODUCT MAPPING FOR DATABASE');
  console.log(`${'='.repeat(80)}\n`);

  const mappingData = [];
  for (const [path, product] of Object.entries(products)) {
    const productName = [
      product.gender,
      product.category,
      product.productType
    ].filter(Boolean).join(' ');

    const mainCategory = 
      product.gender === 'Mens' ? 'MEN' :
      product.gender === 'Women' ? 'WOMEN' :
      product.gender === 'Boys' || product.gender === 'Girls' ? 'KIDS' : 'OTHER';

    const subCategory = 
      product.gender === 'Boys' ? 'Boys' :
      product.gender === 'Girls' ? 'Girls' : null;

    mappingData.push({
      productName,
      mainCategory,
      subCategory,
      imageCount: product.images.length,
      needsConversion: product.heicCount > 0,
    });
  }

  console.log('Product Name | Main Category | Sub Category | Images | Needs Conversion');
  console.log('-'.repeat(120));
  mappingData.forEach(item => {
    console.log(
      `${item.productName.padEnd(45)} | ` +
      `${item.mainCategory.padEnd(13)} | ` +
      `${(item.subCategory || '-').padEnd(12)} | ` +
      `${String(item.imageCount).padEnd(6)} | ` +
      `${item.needsConversion ? '✓ YES' : '- NO'}`
    );
  });

  console.log('\n\n🔧 NEXT STEPS');
  console.log(`${'='.repeat(80)}`);
  console.log('1. Install ImageMagick for HEIC conversion:');
  console.log('   Download from: https://imagemagick.org/script/download.php');
  console.log('   Or use: winget install ImageMagick.ImageMagick\n');
  console.log('2. Run the conversion and import script:');
  console.log('   node server/scripts/convert_and_import_products.js\n');
  console.log('3. Update product details (prices, descriptions, sizes) in the admin panel\n');
}

// Run the script
main().catch(console.error);
