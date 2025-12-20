import fs from 'fs';
import path from 'path';

const PRODUCTS_DIR = path.join(process.cwd(), 'storage', 'uploads', 'products');

function scanAllImages() {
  let totalImages = 0;
  const productMap: { [key: string]: number } = {};
  
  function scanDir(dir: string, productPath: string = '') {
    const items = fs.readdirSync(dir);
    
    const images = items.filter(f => {
      const fullPath = path.join(dir, f);
      return fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png|gif)$/i.test(f);
    });
    
    if (images.length > 0) {
      productMap[productPath || 'root'] = images.length;
      totalImages += images.length;
      console.log(`${productPath}: ${images.length} images`);
    }
    
    const folders = items.filter(f => {
      const fullPath = path.join(dir, f);
      return fs.statSync(fullPath).isDirectory();
    });
    
    for (const folder of folders) {
      const newPath = productPath ? `${productPath}/${folder}` : folder;
      scanDir(path.join(dir, folder), newPath);
    }
  }
  
  scanDir(PRODUCTS_DIR);
  
  console.log(`\n📊 Total: ${Object.keys(productMap).length} folders with ${totalImages} images`);
}

scanAllImages();
