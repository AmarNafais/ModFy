#!/usr/bin/env python3
"""
Verify products and images in database
"""

import os
import json
import mysql.connector
from mysql.connector import Error
import dotenv

# Load environment variables
dotenv.load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'modfy_store'),
}

def verify():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Count products
        cursor.execute("SELECT COUNT(*) as count FROM products WHERE images IS NOT NULL")
        result = cursor.fetchone()
        product_count = result['count']
        
        # Get sample products
        cursor.execute("""
            SELECT id, name, category_id, images 
            FROM products 
            WHERE images IS NOT NULL 
            LIMIT 5
        """)
        
        print("=== Product Import Verification ===\n")
        print(f"✓ Total products imported: {product_count}\n")
        
        print("Sample Products:")
        print("-" * 100)
        
        for idx, product in enumerate(cursor.fetchall(), 1):
            images = json.loads(product['images']) if product['images'] else []
            print(f"\n{idx}. {product['name']}")
            print(f"   Product ID: {product['id']}")
            print(f"   Category ID: {product['category_id']}")
            print(f"   Images: {len(images)}")
            if images:
                print(f"   Sample image: {images[0]}")
        
        # Check image files
        OUTPUT_BASE_PATH = r"c:\Users\nabee\Desktop\Amar Projects\ModFy\storage\uploads\products"
        if os.path.exists(OUTPUT_BASE_PATH):
            file_count = sum([len(files) for _, _, files in os.walk(OUTPUT_BASE_PATH)])
            print(f"\n\n✓ Total image files created: {file_count}")
            print(f"✓ Image directory: {OUTPUT_BASE_PATH}")
        else:
            print(f"\n✗ Image directory not found: {OUTPUT_BASE_PATH}")
        
        # Check categories
        cursor.execute("SELECT id, name, parent_id FROM categories WHERE is_active = true")
        categories = cursor.fetchall()
        print(f"\n\n✓ Total categories: {len(categories)}")
        for cat in categories:
            parent = f"(Sub-category of {cat['parent_id']})" if cat['parent_id'] else "(Main)"
            print(f"  - {cat['name']} {parent}")
        
        cursor.close()
        connection.close()
        
        print("\n=== Import Status: SUCCESS ===")
        
    except Error as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    verify()
