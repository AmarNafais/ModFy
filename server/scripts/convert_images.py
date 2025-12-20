#!/usr/bin/env python3
"""
Product Image Converter - Converts HEIC images to PNG and imports products to database
"""

import os
import sys
import json
import uuid
from pathlib import Path
from PIL import Image
import pillow_heif
import mysql.connector
from mysql.connector import Error
import dotenv

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

# Load environment variables
dotenv.load_dotenv()

# Configuration
PRODUCTS_BASE_PATH = r"c:\Users\nabee\Desktop\Amar Projects\ModFy\storage\uploads\products"
OUTPUT_BASE_PATH = r"c:\Users\nabee\Desktop\Amar Projects\ModFy\storage\uploads\products"

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'modfy_store'),
}

# Category mappings
CATEGORY_MAPPINGS = {
    'Boys': {
        'main': 'MEN',
        'sub': 'Boys',
    },
    'Girls': {
        'main': 'WOMEN',
        'sub': 'Girls',
    },
    'Mens': {
        'main': 'MEN',
        'sub': None,
    },
    'Women': {
        'main': 'WOMEN',
        'sub': None,
    }
}

class ImageConverter:
    def __init__(self):
        self.converted_count = 0
        self.copied_count = 0
        self.failed_count = 0

    def ensure_dir(self, path):
        """Ensure directory exists"""
        Path(path).mkdir(parents=True, exist_ok=True)

    def convert_heic_to_png(self, input_path, output_path):
        """Convert HEIC image to PNG"""
        try:
            self.ensure_dir(os.path.dirname(output_path))
            
            # Open HEIC image
            image = Image.open(input_path)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                rgb_image.save(output_path, 'PNG', quality=95)
            else:
                image.save(output_path, 'PNG', quality=95)
            
            self.converted_count += 1
            print(f"✓ Converted: {os.path.basename(input_path)} → {os.path.basename(output_path)}")
            return output_path
        except Exception as e:
            self.failed_count += 1
            print(f"✗ Failed to convert {input_path}: {str(e)}")
            return None

    def copy_image(self, input_path, output_path):
        """Copy image file"""
        try:
            self.ensure_dir(os.path.dirname(output_path))
            
            # Open and save to ensure compatibility
            image = Image.open(input_path)
            if image.mode == 'RGBA':
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[3])
                rgb_image.save(output_path, quality=95)
            else:
                image.save(output_path, quality=95)
            
            self.copied_count += 1
            print(f"✓ Copied: {os.path.basename(input_path)}")
            return output_path
        except Exception as e:
            self.failed_count += 1
            print(f"✗ Failed to copy {input_path}: {str(e)}")
            return None

    def process_image(self, input_path):
        """Process image and return output path"""
        file_ext = os.path.splitext(input_path)[1].lower()
        
        # Get relative path from base directory
        rel_path = os.path.relpath(input_path, PRODUCTS_BASE_PATH)
        
        # Create output filename (convert HEIC to PNG)
        if file_ext == '.heic':
            output_filename = os.path.splitext(os.path.basename(input_path))[0] + '.png'
        else:
            output_filename = os.path.basename(input_path)
        
        # Create output path
        output_dir = os.path.join(OUTPUT_BASE_PATH, os.path.dirname(rel_path))
        output_path = os.path.join(output_dir, output_filename)
        
        # Process image
        if file_ext.lower() == '.heic':
            return self.convert_heic_to_png(input_path, output_path)
        elif file_ext.lower() in ['.jpg', '.jpeg', '.png']:
            return self.copy_image(input_path, output_path)
        
        return None

    def scan_images(self):
        """Scan for all image files"""
        images = []
        for root, dirs, files in os.walk(PRODUCTS_BASE_PATH):
            for file in files:
                if file.lower().endswith(('.heic', '.jpg', '.jpeg', '.png')):
                    images.append(os.path.join(root, file))
        return images

    def group_by_product(self, images):
        """Group images by product folder"""
        products = {}
        
        for image_path in images:
            rel_path = os.path.relpath(image_path, PRODUCTS_BASE_PATH)
            parts = rel_path.split(os.sep)
            
            if len(parts) < 2:
                continue
            
            # Get folder path (without filename)
            folder_path = os.path.dirname(rel_path)
            
            if folder_path not in products:
                folder_parts = parts[:-1]  # Exclude image filename
                products[folder_path] = {
                    'gender': folder_parts[0],
                    'category': folder_parts[1] if len(folder_parts) > 1 else None,
                    'product_type': folder_parts[2] if len(folder_parts) > 2 else None,
                    'folder_path': folder_path,
                    'images': [],
                }
            
            products[folder_path]['images'].append(image_path)
        
        return products

    def convert_all(self):
        """Convert all images"""
        print("=== Product Image Converter ===\n")
        print("Step 1: Scanning for images...")
        
        images = self.scan_images()
        print(f"Found {len(images)} image files\n")
        
        heic_files = [img for img in images if img.lower().endswith('.heic')]
        other_files = [img for img in images if not img.lower().endswith('.heic')]
        
        print(f"Step 2: Converting {len(heic_files)} HEIC images to PNG...")
        for img in heic_files:
            self.process_image(img)
        
        print(f"\nStep 3: Copying {len(other_files)} JPG/PNG images...")
        for img in other_files:
            self.process_image(img)
        
        print(f"\n=== Summary ===")
        print(f"Converted: {self.converted_count} HEIC files")
        print(f"Copied: {self.copied_count} files")
        print(f"Failed: {self.failed_count} files")
        print(f"Total: {self.converted_count + self.copied_count} files processed")
        
        return images


class DatabaseImporter:
    def __init__(self):
        self.connection = None
        self.categories_cache = {}

    def connect(self):
        """Connect to MySQL database"""
        try:
            self.connection = mysql.connector.connect(**DB_CONFIG)
            print("✓ Connected to database")
            return True
        except Error as e:
            print(f"✗ Database connection failed: {e}")
            return False

    def disconnect(self):
        """Disconnect from database"""
        if self.connection:
            self.connection.close()
            print("✓ Disconnected from database")

    def get_or_create_category(self, name, parent_id=None):
        """Get or create category"""
        if name in self.categories_cache:
            return self.categories_cache[name]
        
        cursor = self.connection.cursor(dictionary=True)
        
        try:
            # Check if exists
            slug = name.lower().replace(' ', '-').replace('_', '-')
            cursor.execute("SELECT id FROM categories WHERE slug = %s LIMIT 1", (slug,))
            result = cursor.fetchone()
            
            if result:
                self.categories_cache[name] = result['id']
                return result['id']
            
            # Create new
            category_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO categories (id, name, slug, parent_id, is_active) 
                   VALUES (%s, %s, %s, %s, true)""",
                (category_id, name, slug, parent_id)
            )
            self.connection.commit()
            self.categories_cache[name] = category_id
            print(f"✓ Created category: {name}")
            return category_id
        
        except Error as e:
            print(f"✗ Error creating category {name}: {e}")
            return None
        finally:
            cursor.close()

    def insert_product(self, product_data):
        """Insert or update product"""
        cursor = self.connection.cursor(dictionary=True)
        
        try:
            slug = product_data['name'].lower().replace(' ', '-').replace('_', '-')
            
            # Check if exists
            cursor.execute("SELECT id FROM products WHERE slug = %s LIMIT 1", (slug,))
            result = cursor.fetchone()
            
            images_json = json.dumps(product_data['images'])
            
            if result:
                # Update
                cursor.execute(
                    """UPDATE products 
                       SET name = %s, category_id = %s, subcategory_id = %s, images = %s
                       WHERE id = %s""",
                    (
                        product_data['name'],
                        product_data['category_id'],
                        product_data['subcategory_id'],
                        images_json,
                        result['id']
                    )
                )
                print(f"✓ Updated product: {product_data['name']}")
            else:
                # Insert
                product_id = str(uuid.uuid4())
                cursor.execute(
                    """INSERT INTO products 
                       (id, name, slug, description, price, category_id, subcategory_id, images, is_active, stock_quantity)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        product_id,
                        product_data['name'],
                        slug,
                        product_data['description'],
                        0.00,
                        product_data['category_id'],
                        product_data['subcategory_id'],
                        images_json,
                        True,
                        0
                    )
                )
                print(f"✓ Created product: {product_data['name']}")
            
            self.connection.commit()
            return True
        
        except Error as e:
            print(f"✗ Error inserting product: {e}")
            return False
        finally:
            cursor.close()

    def import_products(self, products_dict):
        """Import all products"""
        print("\n=== Importing Products to Database ===\n")
        
        for folder_path, product_info in products_dict.items():
            # Get category info
            gender = product_info['gender']
            category_map = CATEGORY_MAPPINGS.get(gender, {})
            
            main_cat = category_map.get('main')
            sub_cat = category_map.get('sub')
            
            # Get or create categories
            category_id = None
            subcategory_id = None
            
            if main_cat:
                category_id = self.get_or_create_category(main_cat)
            
            if sub_cat and category_id:
                subcategory_id = self.get_or_create_category(sub_cat, category_id)
            
            # Generate product name
            product_name_parts = [
                product_info['gender'],
                product_info['category'],
                product_info['product_type']
            ]
            product_name = ' '.join([p for p in product_name_parts if p])
            
            # Generate image URLs (relative to storage)
            image_urls = []
            for img_path in product_info['images']:
                # Convert to relative URL path
                rel_path = os.path.relpath(img_path, PRODUCTS_BASE_PATH)
                
                if img_path.lower().endswith('.heic'):
                    # Image was converted to PNG
                    rel_path = os.path.splitext(rel_path)[0] + '.png'
                
                # Convert to forward slashes for web paths
                url_path = 'products/' + rel_path.replace(os.sep, '/')
                image_urls.append(url_path)
            
            # Insert product
            product_data = {
                'name': product_name,
                'description': f"{product_name} - Available in multiple colors and sizes",
                'category_id': category_id,
                'subcategory_id': subcategory_id,
                'images': image_urls,
            }
            
            self.insert_product(product_data)

def main():
    # Step 1: Convert images
    converter = ImageConverter()
    images = converter.convert_all()
    
    if not images:
        print("No images found!")
        return
    
    # Step 2: Group by product
    print("\nStep 4: Grouping images by product...")
    products_dict = converter.group_by_product(images)
    print(f"Identified {len(products_dict)} products\n")
    
    # Step 3: Import to database
    importer = DatabaseImporter()
    if importer.connect():
        importer.import_products(products_dict)
        importer.disconnect()
        
        print(f"\n✓ Import completed successfully!")
        print(f"Images saved to: {OUTPUT_BASE_PATH}")
    else:
        print("Failed to connect to database!")

if __name__ == '__main__':
    main()
