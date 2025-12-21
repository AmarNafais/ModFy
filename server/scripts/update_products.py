#!/usr/bin/env python3
"""
Update product details (prices, descriptions, sizes, stock)
Usage: python update_products.py
"""

import os
import mysql.connector
from mysql.connector import Error
import json
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

def update_product_price(cursor, product_name, price):
    """Update product price"""
    try:
        cursor.execute(
            "UPDATE products SET price = %s WHERE name LIKE %s",
            (float(price), f"%{product_name}%")
        )
        return cursor.rowcount
    except Error as e:
        print(f"Error: {e}")
        return 0

def update_product_stock(cursor, product_name, stock):
    """Update product stock quantity"""
    try:
        cursor.execute(
            "UPDATE products SET stock_quantity = %s WHERE name LIKE %s",
            (int(stock), f"%{product_name}%")
        )
        return cursor.rowcount
    except Error as e:
        print(f"Error: {e}")
        return 0

def update_product_description(cursor, product_name, description):
    """Update product description"""
    try:
        cursor.execute(
            "UPDATE products SET description = %s WHERE name LIKE %s",
            (description, f"%{product_name}%")
        )
        return cursor.rowcount
    except Error as e:
        print(f"Error: {e}")
        return 0

def update_product_sizes(cursor, product_name, sizes_json):
    """Update product sizes"""
    try:
        cursor.execute(
            "UPDATE products SET sizes = %s WHERE name LIKE %s",
            (sizes_json, f"%{product_name}%")
        )
        return cursor.rowcount
    except Error as e:
        print(f"Error: {e}")
        return 0

def view_products(cursor):
    """View all products and their current details"""
    try:
        cursor.execute(
            """SELECT id, name, price, stock_quantity, description 
               FROM products 
               WHERE images IS NOT NULL
               ORDER BY name"""
        )
        
        products = cursor.fetchall()
        print("\n" + "="*150)
        print(f"{'Product Name':<40} | {'Price':<8} | {'Stock':<6} | {'Description':<80}")
        print("="*150)
        
        for prod in products:
            desc = prod[4] if prod[4] else "-"
            desc = desc[:77] + "..." if len(desc) > 80 else desc
            print(f"{prod[1]:<40} | ${prod[2]:<7.2f} | {prod[3]:<6} | {desc:<80}")
        
        print("="*150 + "\n")
        return products
    except Error as e:
        print(f"Error: {e}")
        return []

def bulk_update_prices():
    """Bulk update prices for products"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n=== Bulk Update Product Prices ===\n")
        
        # Example pricing for different categories
        updates = [
            ("Boys Cantex Junior Boxer", 299),
            ("Boys Junior Brief", 249),
            ("Boys Pants", 399),
            ("Boys Vest", 349),
            ("Girls Panties", 249),
            ("Girls Vest", 349),
            ("Mens Underwear Apple", 399),
            ("Mens Underwear Classic", 399),
            ("Mens Underwear Short Boxer", 499),
            ("Mens Underwear Long boxer", 599),
            ("Mens Pants", 599),
            ("Mens Ultimate", 799),
            ("Mens Vest", 399),
            ("Women Panties", 299),
            ("Women Vest", 399),
        ]
        
        for product_name, price in updates:
            updated = update_product_price(cursor, product_name, price)
            if updated > 0:
                print(f"✓ Updated {updated} product(s): {product_name} → ₹{price}")
        
        connection.commit()
        print("\n✓ Prices updated successfully!")
        
        # Show updated products
        view_products(cursor)
        
        cursor.close()
        connection.close()
    except Error as e:
        print(f"✗ Error: {e}")

def bulk_update_stock():
    """Bulk update stock quantities"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n=== Bulk Update Stock Quantities ===\n")
        
        # Example stock quantities
        updates = [
            ("Boys", 50),
            ("Girls", 40),
            ("Mens", 60),
            ("Women", 55),
        ]
        
        for product_pattern, stock in updates:
            updated = update_product_stock(cursor, product_pattern, stock)
            if updated > 0:
                print(f"✓ Updated {updated} product(s): {product_pattern} → {stock} units")
        
        connection.commit()
        print("\n✓ Stock updated successfully!")
        
        cursor.close()
        connection.close()
    except Error as e:
        print(f"✗ Error: {e}")

def add_product_sizes():
    """Add sizes to products"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n=== Add Product Sizes ===\n")
        
        # Default sizes for different product types
        size_updates = [
            ("Underwear", ["XS", "S", "M", "L", "XL", "XXL"]),
            ("Panties", ["S", "M", "L", "XL"]),
            ("Pants", ["26", "28", "30", "32", "34", "36"]),
            ("Vest", ["S", "M", "L", "XL"]),
        ]
        
        for product_pattern, sizes in size_updates:
            sizes_json = json.dumps(sizes)
            updated = update_product_sizes(cursor, product_pattern, sizes_json)
            if updated > 0:
                print(f"✓ Updated {updated} product(s): {product_pattern} → {sizes}")
        
        connection.commit()
        print("\n✓ Sizes added successfully!")
        
        cursor.close()
        connection.close()
    except Error as e:
        print(f"✗ Error: {e}")

def activate_all_products():
    """Activate all products with images"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n=== Activate All Products ===\n")
        
        cursor.execute("UPDATE products SET is_active = true WHERE images IS NOT NULL")
        connection.commit()
        
        updated = cursor.rowcount
        print(f"✓ Activated {updated} products")
        
        cursor.close()
        connection.close()
    except Error as e:
        print(f"✗ Error: {e}")

def main():
    print("\n=== Product Update Utility ===\n")
    print("Options:")
    print("1. View all products")
    print("2. Bulk update prices")
    print("3. Bulk update stock")
    print("4. Add product sizes")
    print("5. Activate all products")
    print("6. Exit")
    
    choice = input("\nSelect an option (1-6): ").strip()
    
    if choice == "1":
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            cursor = connection.cursor(dictionary=True)
            view_products(cursor)
            cursor.close()
            connection.close()
        except Error as e:
            print(f"✗ Error: {e}")
    elif choice == "2":
        bulk_update_prices()
    elif choice == "3":
        bulk_update_stock()
    elif choice == "4":
        add_product_sizes()
    elif choice == "5":
        activate_all_products()
    elif choice == "6":
        print("Exiting...")
    else:
        print("Invalid option!")

if __name__ == '__main__':
    main()
