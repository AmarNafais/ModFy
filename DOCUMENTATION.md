# 📚 Documentation Index

## Quick References

### 🖼️ Image Management
- **[IMAGES.md](IMAGES.md)** - Quick start guide for image operations
- **[server/scripts/IMAGE_UPDATE_README.md](server/scripts/IMAGE_UPDATE_README.md)** - Complete technical documentation
- **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** - Project cleanup details and workflow examples

### 🗄️ Database & Setup
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Initial database configuration
- **[CATEGORIES_README.md](CATEGORIES_README.md)** - Category structure and management

### 📦 Products & Import
- **[PRODUCT_IMPORT.md](PRODUCT_IMPORT.md)** - Product import process
- **[IMPORT_COMPLETION_REPORT.md](IMPORT_COMPLETION_REPORT.md)** - Import status report
- **[PRODUCTS_READY.md](PRODUCTS_READY.md)** - Products availability status

### 🐛 Troubleshooting
- **[PRODUCTS_NOT_SHOWING_FIX.md](PRODUCTS_NOT_SHOWING_FIX.md)** - Debug checklist for display issues
- **[IMAGE_UPLOAD.md](IMAGE_UPLOAD.md)** - Image upload troubleshooting

### 📋 Additional
- **[ANALYSIS_SUMMARY.md](ANALYSIS_SUMMARY.md)** - Project analysis summary
- **[IMAGE_STORAGE_ORGANIZATION.md](IMAGE_STORAGE_ORGANIZATION.md)** - Storage folder structure
- **[QUICK_START.md](QUICK_START.md)** - Development quick start
- **[replit.md](replit.md)** - Replit-specific configuration

---

## Common Tasks

### 🔄 Update Product Images
```bash
npx ts-node server/scripts/update-images.ts
```
See: **[IMAGES.md](IMAGES.md)** for quick start or **[IMAGE_UPDATE_README.md](server/scripts/IMAGE_UPDATE_README.md)** for details

### ➕ Add New Products
1. Create product folders in `storage/uploads/products/`
2. Add product to database
3. Run image update script
See: **[PRODUCT_IMPORT.md](PRODUCT_IMPORT.md)**

### 🔧 Fix Display Issues
Check: **[PRODUCTS_NOT_SHOWING_FIX.md](PRODUCTS_NOT_SHOWING_FIX.md)**

### 📁 Understand Folder Structure
See: **[IMAGE_STORAGE_ORGANIZATION.md](IMAGE_STORAGE_ORGANIZATION.md)**

---

## Project Statistics

- **Total Products:** 64
- **Products with Images:** 47
- **Total Images:** 226
- **Storage Size:** 1.2 GB
- **Image Formats:** JPG, PNG

---

## Key Files

### Scripts
- `server/scripts/update-images.ts` - Image synchronization utility ⭐
- `server/scripts/seed.ts` - Database seeding
- `server/db.ts` - Database connection
- `server/routes.ts` - API endpoints

### Frontend
- `client/src/components/ProductCard.tsx` - Product display component
- `client/src/components/ProductGrid.tsx` - Product grid layout
- `client/src/pages/Shop.tsx` - Shop page

### Storage
- `storage/uploads/products/` - Product image storage

---

## Support

For detailed information about any topic, refer to the specific documentation files listed above.

**Last Updated:** December 20, 2025
