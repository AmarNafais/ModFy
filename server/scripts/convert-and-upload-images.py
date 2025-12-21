#!/usr/bin/env python3
"""
Convert and Upload Images Script
- Converts HEIC images to PNG
- Optimizes all images for web (resize to 1200px max, convert PNG to JPG, compress)
- Uploads images to database
"""

import os
import sys
import subprocess
from pathlib import Path
from PIL import Image
import pillow_heif
import mysql.connector
from mysql.connector import Error
import json
from dotenv import load_dotenv

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

# Load environment variables
load_dotenv()

# Configuration
PRODUCTS_BASE_PATH = Path(__file__).parent.parent.parent / "storage" / "products"
UPLOADS_PATH = Path(__file__).parent.parent.parent / "storage" / "uploads" / "products"
PATH_PREFIX = "/storage/uploads/products"

# Web optimization settings
MAX_DIMENSION = 1200
JPG_QUALITY = 85

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'modfy_store'),
}

class ImageProcessor:
    def __init__(self):
        self.converted_heic = 0
        self.optimized = 0
        self.resized = 0
        self.failed = 0
        self.total_size_before = 0
        self.total_size_after = 0

    def get_file_size_mb(self, file_path):
        """Get file size in MB"""
        return os.path.getsize(file_path) / (1024 * 1024)

    def should_resize(self, image):
        """Check if image needs resizing"""
        width, height = image.size
        return width > MAX_DIMENSION or height > MAX_DIMENSION

    def calculate_new_size(self, image):
        """Calculate new size maintaining aspect ratio"""
        width, height = image.size
        
        if width > height:
            if width > MAX_DIMENSION:
                new_width = MAX_DIMENSION
                new_height = int((MAX_DIMENSION / width) * height)
            else:
                return width, height
        else:
            if height > MAX_DIMENSION:
                new_height = MAX_DIMENSION
                new_width = int((MAX_DIMENSION / height) * width)
            else:
                return width, height
        
        return new_width, new_height

    def convert_heic_to_png(self, heic_path):
        """Convert HEIC file to PNG"""
        try:
            image = Image.open(heic_path)
            png_path = heic_path.with_suffix('.png')
            
            if image.mode in ('RGBA', 'LA', 'P'):
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode in ('RGBA', 'LA'):
                    rgb_image.paste(image, mask=image.split()[-1])
                else:
                    rgb_image.paste(image)
                rgb_image.save(png_path, 'PNG', optimize=True)
            else:
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                image.save(png_path, 'PNG', optimize=True)
            
            heic_path.unlink()  # Delete original HEIC
            self.converted_heic += 1
            return png_path
        except Exception as e:
            print(f"  ✗ Failed to convert {heic_path.name}: {str(e)}")
            self.failed += 1
            return None

    def optimize_image(self, image_path):
        """Optimize image for web"""
        try:
            if not image_path.exists():
                return None

            original_size = self.get_file_size_mb(image_path)
            self.total_size_before += original_size
            
            img = Image.open(image_path)
            needs_resize = self.should_resize(img)
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                has_transparency = False
                if img.mode == 'RGBA':
                    alpha = img.split()[-1]
                    has_transparency = alpha.getextrema()[0] < 255
                
                if not has_transparency:
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = rgb_img
            
            # Resize if needed
            if needs_resize:
                new_size = self.calculate_new_size(img)
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                self.resized += 1
            
            ext = image_path.suffix.lower()
            
            if ext == '.png':
                # Convert PNG to JPG for better compression
                output_path = image_path.with_suffix('.jpg')
                img.convert('RGB').save(output_path, 'JPEG', quality=JPG_QUALITY, optimize=True)
                
                if output_path != image_path:
                    image_path.unlink()
                final_path = output_path
            elif ext in ['.jpg', '.jpeg']:
                # Re-save JPG with optimization
                img.save(image_path, 'JPEG', quality=JPG_QUALITY, optimize=True)
                final_path = image_path
            else:
                return image_path
            
            new_size = self.get_file_size_mb(final_path)
            self.total_size_after += new_size
            self.optimized += 1
            
            return final_path
            
        except Exception as e:
            print(f"  ✗ Failed to optimize {image_path.name}: {str(e)}")
            self.failed += 1
            return image_path

    def process_directory(self, directory):
        """Process all images in directory"""
        print(f"\n📁 Processing: {directory.relative_to(PRODUCTS_BASE_PATH)}")
        
        processed_files = []
        
        # First convert HEIC files
        heic_files = list(directory.rglob("*.[Hh][Ee][Ii][Cc]"))
        for heic_file in heic_files:
            print(f"  🔄 Converting {heic_file.name}...")
            png_file = self.convert_heic_to_png(heic_file)
            if png_file:
                processed_files.append(png_file)
        
        # Then optimize all images
        image_files = []
        for ext in ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']:
            image_files.extend(directory.rglob(ext))
        
        for img_file in image_files:
            if img_file in processed_files:
                continue  # Already converted
            
            optimized = self.optimize_image(img_file)
            if optimized:
                processed_files.append(optimized)
        
        return processed_files

def copy_to_uploads(source_path, uploads_path):
    """Copy files from products to uploads directory"""
    print("\n📦 Copying files to uploads directory...")
    
    uploads_path.mkdir(parents=True, exist_ok=True)
    
    def copy_recursive(src, dest):
        if src.is_file():
            dest.parent.mkdir(parents=True, exist_ok=True)
            import shutil
            shutil.copy2(src, dest)
        elif src.is_dir():
            dest.mkdir(parents=True, exist_ok=True)
            for item in src.iterdir():
                copy_recursive(item, dest / item.name)
    
    copy_recursive(source_path, uploads_path)
    print("  ✅ Files copied successfully")

def scan_product_images(uploads_dir):
    """Scan uploads directory and build product image map"""
    product_map = {}
    
    def scan_dir(directory, relative_path=''):
        items = list(directory.iterdir())
        
        # Find image files in current directory
        image_files = [
            f for f in items 
            if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        ]
        
        if image_files:
            # Found a product folder with images
            images = [
                f"{PATH_PREFIX}/{relative_path.lower()}/{img.name}"
                for img in image_files
            ]
            
            folder_key = relative_path.lower().replace('\\', '/').strip('/')
            product_map[folder_key] = {
                'images': images,
                'folder': relative_path.replace('\\', '/')
            }
        
        # Recurse into subdirectories
        folders = [f for f in items if f.is_dir()]
        for folder in folders:
            new_path = f"{relative_path}/{folder.name}" if relative_path else folder.name
            scan_dir(folder, new_path)
    
    scan_dir(uploads_dir)
    return product_map

def update_database(product_map):
    """Update database with image paths"""
    print("\n🗄️  Updating database...")
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Get active products
        cursor.execute("SELECT id, name FROM products WHERE is_active = 1")
        db_products = cursor.fetchall()
        
        updated = 0
        used_folders = set()
        
        for product in db_products:
            # Find matching folder for product
            match = None
            best_score = 0
            best_folder_key = ''
            
            product_name = product['name'].lower().replace('-', ' ').replace('_', ' ').strip()
            
            for folder_key, value in product_map.items():
                if folder_key in used_folders:
                    continue
                
                folder_path = value['folder'].lower()
                folder_name = folder_path.split('/')[-1] if '/' in folder_path else folder_path
                category = folder_path.split('/')[0] if '/' in folder_path else ''
                
                score = 0
                
                # Exact match
                if folder_name.replace('-', ' ').replace('_', ' ') == product_name:
                    score += 100
                
                # Category matching
                if 'boys' in product_name and category == 'boys':
                    score += 25
                if 'girls' in product_name and category == 'girls':
                    score += 25
                if ('mens' in product_name or 'cantex mens' in product_name) and category == 'mens':
                    score += 25
                if 'women' in product_name and category == 'women':
                    score += 25
                
                # Word matching
                product_words = [w for w in product_name.split() if len(w) > 3]
                folder_words = [w for w in folder_path.replace('/', ' ').split() if len(w) > 3]
                
                for word in product_words:
                    if word in folder_words:
                        score += 15
                
                if score > best_score and score >= 20:
                    best_score = score
                    match = value
                    best_folder_key = folder_key
            
            if match:
                used_folders.add(best_folder_key)
                images_json = json.dumps(match['images'])
                
                cursor.execute(
                    "UPDATE products SET images = %s WHERE id = %s",
                    (images_json, product['id'])
                )
                
                updated += 1
                print(f"  ✅ {product['name']}: {len(match['images'])} images")
        
        connection.commit()
        
        # Get final statistics
        cursor.execute("""
            SELECT COUNT(*) as count FROM products 
            WHERE images IS NOT NULL AND images != '[]' AND is_active = 1
        """)
        with_images = cursor.fetchone()['count']
        
        cursor.execute("""
            SELECT SUM(JSON_LENGTH(images)) as total FROM products 
            WHERE images IS NOT NULL AND images != '[]' AND is_active = 1
        """)
        total_images = cursor.fetchone()['total'] or 0
        
        print(f"\n  📊 Updated {updated} products")
        print(f"  📸 Products with images: {with_images}")
        print(f"  🖼️  Total images: {total_images}")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"  ✗ Database error: {e}")

def main():
    print("\n╔═══════════════════════════════════════════════════╗")
    print("║   CONVERT, OPTIMIZE & UPLOAD IMAGES              ║")
    print("╚═══════════════════════════════════════════════════╝")
    
    if not PRODUCTS_BASE_PATH.exists():
        print(f"\n❌ Products folder not found: {PRODUCTS_BASE_PATH}")
        sys.exit(1)
    
    # Step 1: Process images
    processor = ImageProcessor()
    
    print("\n🔄 STEP 1: Converting and Optimizing Images")
    print("=" * 60)
    
    for category_dir in PRODUCTS_BASE_PATH.iterdir():
        if category_dir.is_dir():
            processor.process_directory(category_dir)
    
    # Step 2: Copy to uploads
    print("\n📦 STEP 2: Preparing Upload Directory")
    print("=" * 60)
    copy_to_uploads(PRODUCTS_BASE_PATH, UPLOADS_PATH)
    
    # Step 3: Scan for images
    print("\n🔍 STEP 3: Scanning Product Images")
    print("=" * 60)
    product_map = scan_product_images(UPLOADS_PATH)
    print(f"  ✅ Found {len(product_map)} product folders with images")
    
    # Step 4: Update database
    print("\n💾 STEP 4: Uploading to Database")
    print("=" * 60)
    update_database(product_map)
    
    # Summary
    print("\n╔═══════════════════════════════════════════════════╗")
    print("║                  FINAL SUMMARY                    ║")
    print("╚═══════════════════════════════════════════════════╝")
    print(f"\n  🔄 HEIC files converted: {processor.converted_heic}")
    print(f"  ✅ Images optimized: {processor.optimized}")
    print(f"  ↔️  Images resized: {processor.resized}")
    print(f"  ❌ Failed: {processor.failed}")
    print(f"\n  💾 Storage:")
    print(f"     Before: {processor.total_size_before:.2f} MB")
    print(f"     After: {processor.total_size_after:.2f} MB")
    if processor.total_size_before > 0:
        saved = processor.total_size_before - processor.total_size_after
        percent = (saved / processor.total_size_before) * 100
        print(f"     Saved: {saved:.2f} MB ({percent:.1f}%)")
    print()

if __name__ == "__main__":
    main()
