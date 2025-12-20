# Image Management - Quick Start

## Update Product Images

If you've added new product images or need to sync images with the database:

```bash
npm run update-images
```

Or manually:
```bash
npx ts-node server/scripts/update-images.ts
```

## Image Organization

Store images at: `storage/uploads/products/[CATEGORY]/[SUBCATEGORY]/[PRODUCT]/`

Example:
```
storage/uploads/products/
├── Boys/
│   └── Cantex Junior Boxer/
│       ├── IMG_3599.jpg
│       ├── IMG_3600.jpg
│       └── ...
├── Mens/
│   └── Underwear/
│       └── Classic/
│           ├── IMG_0431.png
│           ├── IMG_0435.png
│           └── ...
└── Women/
    └── Panties - Women/
        └── Dark Printed/
            ├── IMG_0441.jpg
            └── ...
```

## Current Status

- ✅ 47 products with images
- ✅ 226 total images
- ✅ All image paths normalized and correct

## For Detailed Instructions

See: `server/scripts/IMAGE_UPDATE_README.md`

## To Add to package.json

```json
{
  "scripts": {
    "update-images": "ts-node server/scripts/update-images.ts"
  }
}
```
