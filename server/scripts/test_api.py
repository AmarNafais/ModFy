#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test the API products endpoint
"""

import os
import sys
import subprocess
import time
import requests
import json

print("\n=== Testing API Endpoints ===\n")

# Test if server is running
print("Checking server status...")
try:
    response = requests.get("http://localhost:5000/api/products", timeout=2)
    print(f"✓ Server is running")
    print(f"✓ Status code: {response.status_code}")
    
    products = response.json()
    if isinstance(products, list):
        print(f"✓ Got {len(products)} products from API")
        
        if products:
            print(f"\nSample Product:")
            sample = products[0]
            print(f"  Name: {sample.get('name')}")
            print(f"  Price: {sample.get('price')}")
            print(f"  Images: {len(sample.get('images', []))} files")
            if sample.get('images'):
                print(f"  First Image: {sample['images'][0]}")
    else:
        print(f"✗ Unexpected response format: {type(products)}")
        print(f"Response: {products}")
        
except requests.exceptions.ConnectionError:
    print("✗ Server is not running!")
    print("\nStart the server with:")
    print("  npm run dev")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
