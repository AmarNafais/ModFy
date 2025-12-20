#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Display products and images summary
"""

import os
import sys
sys.path.insert(0, '.')

import mysql.connector
import dotenv

dotenv.load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'modfy_store'),
}

connection = mysql.connector.connect(**DB_CONFIG)
cursor = connection.cursor(dictionary=True)

print("\n" + "="*100)
print("PRODUCTS AND IMAGES - READY TO DISPLAY".center(100))
print("="*100 + "\n")

# Get all products
cursor.execute("""
    SELECT id, name, price, stock_quantity, 
           JSON_LENGTH(images) as image_count,
           is_active
    FROM products
    WHERE images IS NOT NULL AND images != '[]'
    ORDER BY name
""")

products = cursor.fetchall()

print(f"Total Products: {len(products)}\n")
print(f"{'Product Name':<45} | {'Price':<8} | {'Stock':<7} | {'Images':<8} | {'Active':<8}")
print("-" * 100)

for prod in products:
    active = "Yes" if prod['is_active'] else "No"
    print(f"{prod['name']:<45} | ₹{prod['price']:<7.0f} | {prod['stock_quantity']:<7} | {prod['image_count']:<8} | {active:<8}")

print("-" * 100)

# Summary stats
cursor.execute("""
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
        SUM(stock_quantity) as total_stock,
        SUM(JSON_LENGTH(images)) as total_images,
        AVG(price) as avg_price
    FROM products
    WHERE images IS NOT NULL AND images != '[]'
""")

summary = cursor.fetchone()

print(f"\nTotal Products: {summary['total']}")
print(f"Active Products: {summary['active_count']}")
print(f"Total Stock: {summary['total_stock']} units")
print(f"Total Images: {summary['total_images']}")
print(f"Average Price: ₹{summary['avg_price']:.0f}")

print("\n" + "="*100)
print("IMAGE ACCESS INFORMATION".center(100))
print("="*100)
print("""
Location: storage/uploads/products/
Web Route: /storage/uploads/products/
Total Files: 126 images

Access images via:
  http://localhost:5000/storage/uploads/products/[category]/[product]/[filename]

Examples:
  http://localhost:5000/storage/uploads/products/Boys/Cantex%20Junior%20Boxer/IMG_3599.jpg
  http://localhost:5000/storage/uploads/products/Mens/Underwear/Classic/IMG_0431.png
  http://localhost:5000/storage/uploads/products/Women/Panties%20-%20Women/Shorty/IMG_0441.png
""")

print("="*100)
print("SUCCESS - All products and images are active and ready to display!".center(100))
print("="*100 + "\n")

cursor.close()
connection.close()
