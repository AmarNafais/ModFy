# Image Update Script - Documentation

## Overview

The `update-images.ts` script syncs product images from the filesystem into the database. It scans folders, matches them to products, and writes normalized image paths.

## Folder Roles

- `storage/products/` — staging/source set if you prep images before upload.
- `storage/uploads/products/` — default upload location and the source scanned by `update-images`.

## File Structure (lowercase example)

```
storage/products/             # staging
storage/uploads/products/     # uploads (used by update-images)
├── boys/
│   ├── cantex junior boxer/
│   ├── junior brief/
│   ├── pants/
│   │   ├── balloon pocket short/
│   │   └── cargo pants/
│   └── vest - boys/
│       ├── with sleeve/
│       └── without sleeve/
├── girls/
│   ├── panties - girls/
│   └── vest - girls/
├── mens/
│   ├── pants/
│   ├── underwear/
│   ├── ultimate/
│   └── vest/
└── women/
    ├── panties - women/
    └── vest - women/
```

Each product folder should contain PNG/JPEG/HEIC files; the pipeline converts to `.png` in other scripts.

## Usage

### Prerequisites
- `npm install`
- `.env` with DB credentials
- Database reachable

### Run

```bash
npm run update-images
```

## What the Script Does

1) Scans `/storage/uploads/products/` recursively.
2) Matches folder names to products (fuzzy, case-insensitive).
3) Updates `products.images` with normalized paths: `/storage/uploads/products/[category]/[subcategory]/[product]/[filename]`.
4) Normalizes any existing image paths to the `/storage/uploads/products/` prefix.
5) Prints a summary of updates and totals.

## Image Path Format

Pattern:
```
/storage/uploads/products/[category]/[subcategory]/[product]/[filename]
```

Examples:
- `/storage/uploads/products/boys/cantex junior boxer/img_3599.png`
- `/storage/uploads/products/mens/underwear/classic/img_0431.png`
- `/storage/uploads/products/women/panties - women/dark printed/img_0441.png`

## Troubleshooting

- No images found: confirm files exist under `storage/uploads/products/` and extensions are supported.
- Paths wrong: rerun `npm run update-images`; it re-normalizes paths.
- DB connect issues: check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`.

## Related Files

- `server/scripts/update-images.ts` — this script
- `storage/uploads/products/` — upload/source folder scanned
- `storage/products/` — optional staging set if you prep images before upload
