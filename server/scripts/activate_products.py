#!/usr/bin/env python3
"""
Activate all products and set defaults
"""

import os
import sys
import mysql.connector
from mysql.connector import Error
import json
import dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'modfy_store'),
}

try:
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor(dictionary=True)

    print("=== Activating Products & Setting Defaults ===\n")

    # Set default prices by category pattern
    price_updates = {
        "Boys": 299,
        "Girls": 249,
        "Mens Underwear": 399,
        "Mens Pants": 599,
        "Mens Ultimate": 799,
        "Mens Vest": 399,
        "Women Panties": 299,
        "Women Vest": 399,
    }

    for pattern, price in price_updates.items():
        cursor.execute(
            "UPDATE products SET price = %s WHERE name LIKE %s AND price = 0",
            (float(price), f"%{pattern}%")
        )
        if cursor.rowcount > 0:
            print(f"✓ Set price ₹{price} for {cursor.rowcount} {pattern} product(s)")

    connection.commit()

    # Set default stock quantities
    cursor.execute("UPDATE products SET stock_quantity = 50 WHERE stock_quantity = 0 AND images IS NOT NULL")
    updated = cursor.rowcount
    if updated > 0:
        print(f"✓ Set default stock (50 units) for {updated} product(s)")

    connection.commit()

    # Add default sizes
    sizes_by_pattern = {
        "Underwear": ["XS", "S", "M", "L", "XL", "XXL"],
        "Pants": ["26", "28", "30", "32", "34", "36"],
        "Panties": ["S", "M", "L", "XL"],
        "Vest": ["S", "M", "L", "XL"],
    }

    for pattern, sizes in sizes_by_pattern.items():
        sizes_json = json.dumps(sizes)
        cursor.execute(
            "UPDATE products SET sizes = %s WHERE name LIKE %s AND (sizes IS NULL OR sizes = '[]')",
            (sizes_json, f"%{pattern}%")
        )
        if cursor.rowcount > 0:
            print(f"✓ Added sizes {sizes} for {cursor.rowcount} {pattern} product(s)")

    connection.commit()

    # Activate all products with images
    cursor.execute("UPDATE products SET is_active = true WHERE images IS NOT NULL AND images != '[]'")
    activated = cursor.rowcount
    print(f"✓ Activated {activated} product(s)")

    connection.commit()

    # Get summary
    cursor.execute("""
        SELECT COUNT(*) as total, 
               SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active,
               SUM(CASE WHEN price > 0 THEN 1 ELSE 0 END) as with_price,
               SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) as with_stock
        FROM products 
        WHERE images IS NOT NULL
    """)

    summary = cursor.fetchone()
    print(f"\n=== Summary ===")
    print(f"Total Products: {summary['total']}")
    print(f"Active: {summary['active']}")
    print(f"With Prices: {summary['with_price']}")
    print(f"With Stock: {summary['with_stock']}")

    cursor.close()
    connection.close()

    print(f"\n✅ All products are ready to display!")

except Error as e:
    print(f"✗ Database Error: {e}")
    sys.exit(1)
