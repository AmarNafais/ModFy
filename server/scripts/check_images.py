#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check which products have images
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

connection = mysql.connector.connect(**DB_CONFIG)
cursor = connection.cursor(dictionary=True)

print("\n=== Products with Images (First 10) ===\n")

cursor.execute("""
    SELECT id, name, is_active, images, JSON_LENGTH(images) as image_count
    FROM products 
    WHERE images IS NOT NULL AND images != '[]'
    ORDER BY name
    LIMIT 10
""")

results = cursor.fetchall()
for row in results:
    images = json.loads(row['images']) if row['images'] else []
    print(f"{row['name']:<40} | Active: {row['is_active']} | Images: {len(images)}")

print("\n=== Products without Images (First 10) ===\n")

cursor.execute("""
    SELECT id, name, is_active
    FROM products 
    WHERE images IS NULL OR images = '[]'
    ORDER BY name
    LIMIT 10
""")

results = cursor.fetchall()
for row in results:
    print(f"{row['name']:<40} | Active: {row['is_active']} | Images: 0")

cursor.close()
connection.close()
