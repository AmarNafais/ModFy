# Image Management - Quick Start

## Update Product Images

If you've added new product images or need to sync images with the database:

```bash
npm run update-images
```

Or manually:
```bash
npx tsx server/scripts/update-images.ts
```

## Image Organization

**Required Structure:** `storage/uploads/products/[category]/[subcategory]/[product-folder]/`

**Example:**
```
storage/uploads/products/
├── boys/
│   ├── pants/
│   │   └── cargo-pants/
│   │       ├── img-1654--1.png
│   │       ├── img-1654--2.png
│   │       └── ...
│   ├── underwear/
│   │   ├── cantex-junior-boxer/
│   │   └── junior-brief/
│   └── vest/
│       ├── boys-vest-(with-sleeve)/
│       └── boys-vest-(without-sleeve)/
├── men/
│   ├── underwear/
│   │   ├── apple-v-cut/
│   │   ├── classic-v-cut/
│   │   └── ultimate-v-cut/
│   └── vest/
│       └── cantex-mens-vest-(with-sleeve)/
└── women/
    ├── panties/
    │   ├── dark-colour-printed-panties/
    │   ├── fit-shorts-(black)/
    │   └── fit-shorts-(white)/
    └── vest/
        ├── womens-feyolina-vest/
        └── womens-petticoat/
```

## Current Status (Last Updated: Dec 25, 2024)

- ✅ 29 active products with images
- ✅ 118 total images
- ✅ All image paths normalized and correct
- ✅ Intelligent folder-to-product matching

## How It Works

1. Script scans `storage/uploads/products/` for folders with images
2. Matches folder names to database products using smart algorithm
3. Updates product images array with full paths
4. Normalizes any incorrect paths

## For Detailed Instructions

See: `server/scripts/IMAGE_UPDATE_README.md`
