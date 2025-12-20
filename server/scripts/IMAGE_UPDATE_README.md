# Image Update Script - Documentation

## Overview

The `update-images.ts` script is a utility for synchronizing product images from the storage folder with the database. It scans the actual file system and updates the database with correct image paths.

## File Structure

```
storage/uploads/products/
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
│   ├── Underwear/
│   ├── Ultimate/
│   └── Vest/
└── Women/
    ├── Panties - Women/
    └── Vest - Women/
```

Each product folder should contain JPEG/PNG image files.

## Usage

### Prerequisites
- Node.js installed
- Project dependencies installed (`npm install`)
- Environment variables configured (`.env` file)
- Database connection working

### Running the Script

```bash
# From project root directory
npx ts-node server/scripts/update-images.ts
```

Or if using npm scripts, you can add to `package.json`:

```json
{
  "scripts": {
    "update-images": "ts-node server/scripts/update-images.ts"
  }
}
```

Then run:
```bash
npm run update-images
```

### What the Script Does

1. **Scans Storage Folder**
   - Traverses `/storage/uploads/products/` directory
   - Identifies all product folders
   - Lists image files in each folder

2. **Matches Products to Database**
   - Compares folder names with product names in database
   - Uses fuzzy matching (case-insensitive, handles spaces/dashes)

3. **Updates Database**
   - Updates each product's `images` JSON column
   - Stores image paths in format: `/storage/uploads/products/[CATEGORY]/[SUBCATEGORY]/[PRODUCT]/[FILENAME]`

4. **Normalizes Paths**
   - Ensures all paths start with `/storage/uploads/products/`
   - Fixes any incomplete or incorrect paths

5. **Generates Report**
   - Shows number of products updated
   - Shows number of paths normalized
   - Displays final statistics (total products with images, total image count)

## Output Example

```
╔════════════════════════════════════════╗
║   PRODUCT IMAGE UPDATE UTILITY        ║
╚════════════════════════════════════════╝

📁 Scanning storage folder structure...

✅ Found 19 product folders with images

🔄 Matching database products with image folders...

✅ Boys Cantex Junior Boxer: 8 images
✅ Boys Junior Brief: 7 images
✅ Boys Pants Balloon Pocket Short: 6 images
...

╔════════════════════════════════════════╗
║            UPDATE SUMMARY             ║
╚════════════════════════════════════════╝

📸 Products updated with images: 30
🔧 Image paths normalized: 12
❌ Failed to update: 0

📊 Final Status:
   • Active products with images: 47
   • Total images: 226
```

## Database Schema

The script updates the `products` table:

```sql
-- Image storage format (JSON array)
-- Column: images
[
  "/storage/uploads/products/Boys/Cantex Junior Boxer/IMG_3599.jpg",
  "/storage/uploads/products/Boys/Cantex Junior Boxer/IMG_3600.jpg",
  ...
]
```

## Image Path Format

All image paths follow this pattern:
```
/storage/uploads/products/[CATEGORY]/[SUBCATEGORY]/[PRODUCT]/[FILENAME]
```

**Examples:**
- `/storage/uploads/products/Boys/Cantex Junior Boxer/IMG_3599.jpg`
- `/storage/uploads/products/Mens/Underwear/Classic/IMG_0431.png`
- `/storage/uploads/products/Women/Panties - Women/Dark Printed/IMG_0441.png`

## Frontend Usage

### ProductCard Component
```tsx
// Displays first image or fallback
<img 
  src={product.images?.[0] || 'https://example.com/placeholder.png'} 
  alt={product.name}
/>
```

### API Response
```json
{
  "id": "...",
  "name": "Boys Cantex Junior Boxer",
  "images": [
    "/storage/uploads/products/Boys/Cantex Junior Boxer/IMG_3599.jpg",
    "/storage/uploads/products/Boys/Cantex Junior Boxer/IMG_3600.jpg",
    ...
  ],
  "price": "299.00",
  "is_active": true,
  ...
}
```

## Troubleshooting

### Issue: Products not matching
**Solution:** Check folder name spelling and ensure it matches product name in database

### Issue: Image paths still incorrect
**Solution:** Run the script again - it will normalize all paths

### Issue: Script fails to connect
**Solution:** Verify:
- Database is running
- `.env` file has correct DB credentials
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are set

### Issue: No images found
**Solution:** 
- Verify storage folder structure is correct
- Ensure image files are in the right folders
- Check file extensions are .jpg, .jpeg, .png, or .gif

## When to Run This Script

Run this script when:
- Adding new products with images to `/storage/uploads/products/`
- Moving/reorganizing product images
- Fixing missing or broken image references
- After manual file system changes to product folders
- During deployment/migration to ensure images are synced

## Related Files

- `server/routes.ts` - API endpoint for `/api/products`
- `server/dbStorage.ts` - Database query functions
- `server/index.ts` - Express server configuration with static file serving
- `client/src/components/ProductCard.tsx` - Frontend image display
- `storage/uploads/products/` - Physical image storage location

## Notes

- The script only updates products that are `is_active = 1` in the database
- Image paths are stored as JSON arrays in the database
- All image files must be valid image formats (.jpg, .jpeg, .png, .gif)
- The script is safe to run multiple times
- Existing image entries are updated, not duplicated
