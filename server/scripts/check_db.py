#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check database products
"""

import os
import sys
sys.path.insert(0, '.')

import mysql.connector
import json
import dotenv

dotenv.load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'modfy_store'),
}

try:
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor(dictionary=True)
    
    print("\n=== Database Verification ===\n")
    
    # Check if database exists
    cursor.execute("SELECT DATABASE()")
    db = cursor.fetchone()
    print(f"Connected to database: {db['DATABASE()']}")
    
    # Check products table
    cursor.execute("SELECT COUNT(*) as count FROM products")
    count = cursor.fetchone()
    print(f"Total products in table: {count['count']}")
    
    # Check products with images
    cursor.execute("SELECT COUNT(*) as count FROM products WHERE images IS NOT NULL AND images != '[]'")
    with_images = cursor.fetchone()
    print(f"Products with images: {with_images['count']}")
    
    # Check active products
    cursor.execute("SELECT COUNT(*) as count FROM products WHERE is_active = true")
    active = cursor.fetchone()
    print(f"Active products: {active['count']}")
    
    # Get sample product
    cursor.execute("""
        SELECT id, name, slug, price, is_active, images, 
               JSON_LENGTH(images) as image_count
        FROM products 
        WHERE images IS NOT NULL AND images != '[]'
        LIMIT 1
    """)
    sample = cursor.fetchone()
    
    if sample:
        print(f"\nSample Product:")
        print(f"  ID: {sample['id']}")
        print(f"  Name: {sample['name']}")
        print(f"  Slug: {sample['slug']}")
        print(f"  Price: {sample['price']}")
        print(f"  Active: {sample['is_active']}")
        print(f"  Image Count: {sample['image_count']}")
        
        images = json.loads(sample['images']) if sample['images'] else []
        if images:
            print(f"  First Image: {images[0]}")
    
    cursor.close()
    connection.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
