# Image Update Script - Documentation

## Overview

The `update-images.ts` script syncs product images from the filesystem into the database. It scans folders, matches them to products using intelligent name matching, and writes normalized image paths.

## Storage Structure

- `storage/uploads/products/` — The source directory scanned by `update-images`. All product images must be organized here.

## File Structure

```
storage/uploads/products/
├── boys/                          # Main Category
│   ├── pants/                     # Subcategory
│   │   ├── boys-balloon-pocket-shorts/  # Product Folder
│   │   │   ├── img-1654--1.png
│   │   │   ├── img-1654--2.png
│   │   │   └── ...
│   │   └── cargo-pants/
│   │       └── ...
│   ├── underwear/
│   │   ├── cantex-junior-boxer/
│   │   └── junior-brief/
│   └── vest/
│       ├── boys-vest-(with-sleeve)/
│       └── boys-vest-(without-sleeve)/
├── girls/
│   ├── panties/
│   │   ├── girls-shorty-panties/
│   │   ├── lace-school-panties/
│   │   └── scallop-school-panties/
│   └── vest/
│       ├── girls-feyolina-vest/
│       └── girls-petticoat/
├── men/
│   ├── pants/
│   │   └── mens-balloon-pocket-shorts/
│   ├── underwear/
│   │   ├── apple-v-cut/
│   │   ├── classic-v-cut/
│   │   ├── long-boxer/
│   │   ├── short-boxer/
│   │   └── ultimate-v-cut/
│   └── vest/
│       ├── cantex-mens-vest-(with-sleeve)/
│       └── cantex-mens-vest-(without-sleeve)/
├── unisex/
│   └── [subcategory]/
│       └── [product-folder]/
└── women/
    ├── panties/
    │   ├── dark-colour-printed-panties/
    │   ├── feyolina-panties/
    │   ├── fit-shorts-(black)/
    │   ├── fit-shorts-(white)/
    │   ├── light-colour-plain-panties/
    │   └── womens-shorty-panties/
    └── vest/
        ├── womens-feyolina-vest/
        └── womens-petticoat/
```

**Structure Pattern:** `storage/uploads/products/[category]/[subcategory]/[product-folder]/[images]`

Each product folder should contain image files (PNG, JPEG, JPG, GIF, HEIC, WEBP).

## Usage

### Prerequisites
- `npm install`
- `.env` with DB credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Database reachable
- Images organized in `storage/uploads/products/[category]/[subcategory]/[product-folder]/`

### Run

```bash
npm run update-images
```

## What the Script Does

1. **Scans** `/storage/uploads/products/` recursively for all product folders containing images
2. **Matches** folder names to database products using intelligent scoring:
   - Exact name matches (highest priority)
   - Category matching (boys, girls, men, women, unisex)
   - Product type keywords (vest, pants, underwear, boxer, brief, panties)
   - Word similarity and contains checks
3. **Updates** `products.images` field with array of image URLs
4. **Normalizes** any existing image paths to ensure consistent format
5. **Reports** summary: products updated, paths normalized, total images

## Image Path Format

**Pattern:**
```
/storage/uploads/products/[category]/[subcategory]/[product-folder]/[filename]
```

**Examples:**
- `/storage/uploads/products/boys/underwear/cantex-junior-boxer/img-1654--1.png`
- `/storage/uploads/products/men/underwear/classic-v-cut/img-1654--10.png`
- `/storage/uploads/products/women/panties/dark-colour-printed-panties/img-1654--2.png`
- `/storage/uploads/products/boys/vest/boys-vest-(with-sleeve)/img-1654--1.png`

**Note:** Folder names can contain hyphens, parentheses, and mixed case. The script handles normalization automatically.

## Current Status (Last Update: Dec 25, 2024)

- ✅ **28 products** updated with images
- ✅ **118 total images** linked to products
- ✅ **29 active products** with images in database
- ✅ All paths normalized to correct format

## Matching Algorithm

The script uses intelligent matching to link folders to products:

1. **Normalization:** Removes special characters, converts to lowercase
2. **Exact Match:** Folder name matches product name (score: 100)
3. **Word Match:** All product words found in folder name (score: 80)
4. **Category Match:** Correct category folder (score: 25)
5. **Keyword Match:** Product type keywords (score: 15 per word)
6. **Minimum Score:** 20 points required for match

Products matched:
- Cantex Mens Vest, Ultimate V Cut, Apple V Cut, Classic V Cut
- Fit Shorts (Black), Fit Shorts (White)
- Boys/Girls Vest, Petticoat, Feyolina items
- Junior Brief, Boxer, Cargo Pants, Balloon Pocket Shorts
- And many more...

## Troubleshooting

**No images found:**
- Confirm files exist under `storage/uploads/products/[category]/[subcategory]/[product-folder]/`
- Check file extensions are supported: `.jpg, .jpeg, .png, .gif, .heic, .webp`
- Verify folder structure matches pattern

**Products not matching:**
- Product name in database should somewhat match folder name
- Check category is correct (boys/girls/men/women/unisex)
- Folder must be 3 levels deep: category/subcategory/product-folder

**Duplicate paths:**
- Run `npm run update-images` again - it normalizes all paths
- Check database `products.images` field for double prefixes

**DB connection issues:**
- Verify `.env` file has: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Test database connection: `npm run db:studio`

## Related Files

- `server/scripts/update-images.ts` — this script
- `storage/uploads/products/` — upload/source folder scanned
- `storage/products/` — optional staging set if you prep images before upload
