# Product Image Import Guide

This guide will help you convert HEIC images to PNG and import all your product images into the ModFy database.

## 📁 Current Structure

Your products are organized in: `storage/uploads/products/`
```
├── Boys/
│   ├── Cantex Junior Boxer/
│   ├── Junior Brief/
│   ├── Pants/
│   │   ├── Balloon Pocket Short/
│   │   └── Cargo Pants/
│   └── Vest - Boys/
│       ├── With Sleeve/
│       └── Without Sleeve/
├── Girls/
│   ├── Panties - Girls/
│   └── Vest - Girls/
├── Mens/
│   ├── Pants/
│   ├── Ultimate/
│   ├── Underwear/
│   └── Vest/
└── Women/
    ├── Panties - Women/
    └── Vest - Women/
```

## 📊 Image Status

- **Total Images**: 130+
- **HEIC files**: ~89 (need conversion to PNG)
- **JPG/PNG files**: ~41 (ready to use)

## 🚀 Quick Start

### Step 1: Analyze Your Products

First, run the analysis script to see what you have:

```bash
node server/scripts/analyze_products.js
```

This will show you:
- Total images found
- How many need conversion
- Product breakdown by category
- Proposed product names and mappings

### Step 2: Install ImageMagick (for HEIC conversion)

#### Windows (Choose one method):

**Option A: Using winget (Windows Package Manager)**
```bash
winget install ImageMagick.ImageMagick
```

**Option B: Manual Download**
1. Download from: https://imagemagick.org/script/download.php#windows
2. Choose "ImageMagick-7.x.x-Q16-HDRI-x64-dll.exe"
3. Install with default settings
4. Make sure "Install legacy utilities (e.g. convert)" is checked

**Option C: Using Chocolatey**
```bash
choco install imagemagick
```

After installation, verify:
```bash
magick -version
```

### Step 3: Convert and Import

Once ImageMagick is installed, run the import script:

```bash
node server/scripts/convert_and_import_products.js
```

This script will:
1. ✅ Convert all HEIC files to PNG
2. ✅ Copy all JPG/PNG files
3. ✅ Save processed images to `storage/uploads/products/`
4. ✅ Create categories in database if they don't exist
5. ✅ Import products with image references
6. ✅ Match folder structure to product names

## 📋 Category Mapping

The script automatically maps your folder structure to database categories:

| Folder Gender | Main Category | Sub Category |
|--------------|---------------|--------------|
| Boys         | KIDS          | Boys         |
| Girls        | KIDS          | Girls        |
| Mens         | MEN           | -            |
| Women        | WOMEN         | -            |

## 🎯 Product Naming Convention

Products are named by combining folder path elements:

```
Folder: Boys/Underwear/Cantex Junior Boxer/
Product Name: Boys Underwear Cantex Junior Boxer

Folder: Women/Panties - Women/Shorty/
Product Name: Women Panties - Women Shorty

Folder: Mens/Vest/With Sleeve/
Product Name: Mens Vest With Sleeve
```

## 📷 Image Storage

After processing:
- **Original images**: `storage/uploads/products/` (unchanged)
- **Converted/Processed images**: `storage/uploads/products/`
- **Database**: Products table with JSON array of image paths

Example image path in database:
```json
[
  "products/Boys/Cantex Junior Boxer/IMG_3599.jpg",
  "products/Boys/Cantex Junior Boxer/IMG_3600.jpg",
  "products/Boys/Cantex Junior Boxer/IMG_3601.jpg"
]
```

## ⚙️ After Import

Once images are imported, you'll need to update product details in the admin panel:

1. **Prices**: Set base price and size-specific pricing
2. **Descriptions**: Add detailed product descriptions
3. **Sizes**: Configure available sizes
4. **Stock**: Update inventory levels
5. **Active Status**: Enable/disable products

## 🔧 Troubleshooting

### Issue: "magick: command not found"
- ImageMagick is not installed or not in PATH
- Restart your terminal after installing
- Try using `convert` command instead

### Issue: Images not showing on website
- Check if `storage/uploads/products/` folder exists
- Verify image paths in database are correct
- Check file permissions on storage folder

### Issue: Products not appearing
- Verify categories were created in database
- Check `is_active` flag is set to true
- Confirm images array is not empty

### Issue: HEIC conversion fails
- Ensure ImageMagick supports HEIC format
- You may need to install additional delegates
- Try converting one file manually first: `magick input.heic output.png`

## 📝 Database Schema Reference

### Products Table
```typescript
{
  id: string (UUID)
  name: string
  slug: string
  description: string
  price: decimal(10,2)
  categoryId: string (UUID)
  subcategoryId: string (UUID)
  images: json // Array of image paths
  sizes: json // Array of size names
  sizePricing: json // Object with size-price mapping
  is_active: boolean
  stock_quantity: number
}
```

### Categories Table
```typescript
{
  id: string (UUID)
  name: string
  slug: string
  description: string
  parentId: string (UUID, nullable)
  is_active: boolean
}
```

## 🎨 Alternative: Manual HEIC Conversion

If you prefer to convert HEIC files manually:

### Using Online Tools:
- https://heictojpg.com/
- https://convertio.co/heic-png/

### Using Windows Built-in (Windows 11):
1. Select HEIC files
2. Right-click → Open with → Photos
3. Click "..." → Convert to JPEG/PNG

### Using Cloud Storage:
- Upload to Google Photos/iCloud (auto-converts)
- Download as JPG

After manual conversion, update the folder structure and run the import script again.

## 📊 Script Output Example

```
=== Product Image Converter & Importer ===

Step 1: Scanning for images...
Found 130 image files

Step 2: Converting HEIC images to PNG...
89 HEIC files need conversion

✓ Converted: IMG_0487.HEIC → IMG_0487.png
✓ Converted: IMG_0494.HEIC → IMG_0494.png
...

Step 3: Copying JPG/PNG images...
✓ Copied: IMG_3599.jpg
✓ Copied: IMG_3600.jpg
...

Step 4: Grouping images by product...
Identified 45 products

Step 5: Importing to database...
✓ Created category: MEN
✓ Created category: KIDS
✓ Created category: Boys
✓ Created product: Boys Cantex Junior Boxer
✓ Created product: Boys Junior Brief
...

✓ Import completed successfully!

=== Summary ===
Total images processed: 130
HEIC converted: 89
Products created/updated: 45
Images saved to: storage/uploads/products/
```

## 🎯 Next Steps

After successful import:

1. **Review Products**: Go to admin panel → Products
2. **Add Pricing**: Set prices for each product and size variant
3. **Add Descriptions**: Write compelling product descriptions
4. **Configure Sizes**: Set up available sizes per product
5. **Update Stock**: Set initial inventory levels
6. **Activate Products**: Enable products for public viewing
7. **Test Shopping**: Browse your shop page to see products live

## 💡 Tips

- Run the analysis script first to preview what will be imported
- Backup your database before running the import
- The import script is idempotent (safe to run multiple times)
- Existing products will be updated, not duplicated
- Keep original HEIC files as backup
- Consider organizing images by product ID after initial import

## 🆘 Need Help?

If you encounter any issues:
1. Check the error messages carefully
2. Verify database credentials in `.env` file
3. Ensure MySQL server is running
4. Check file permissions on storage folders
5. Review the troubleshooting section above
