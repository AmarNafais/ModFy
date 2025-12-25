# Product Image Upload Feature

## Overview
Product images can now be uploaded directly through the admin panel instead of using external URLs. Images are stored locally in an organized folder structure.

## Storage Structure
```
storage/
  uploads/
    products/
      {category}/           # e.g., boys, girls, men, women, unisex
        {subcategory}/      # e.g., pants, underwear, vest, panties
          {product-folder}/ # e.g., cargo-pants, apple-v-cut
            image-file-1.jpg
            image-file-2.png
            ...
```

**Example:**
```
storage/uploads/products/
  men/underwear/apple-v-cut/img-1654--1.png
  women/panties/fit-shorts-(black)/img-1654--2.png
  boys/vest/boys-vest-(with-sleeve)/img-1654--1.png
```

Images are automatically organized by:
- **Category**: Main category (e.g., "Men" → "men")
- **Subcategory**: Product type (e.g., "Underwear" → "underwear")
- **Product Folder**: Sanitized product name (e.g., "Apple V Cut" → "apple-v-cut")

## Features

### Upload Restrictions
- **Allowed formats**: JPEG, JPG, PNG, GIF, WebP
- **Max file size**: 5MB per file
- **Multiple uploads**: Yes, upload multiple images at once
- **Requirements**: Product name and category must be set before uploading

### Security
- **Authentication required**: Only admin users can upload images
- **File type validation**: Server validates MIME types
- **Automatic sanitization**: Folder and file names are sanitized to prevent path traversal attacks

### Image Naming
Uploaded images are automatically renamed with format:
```
{sanitized-original-name}-{timestamp}-{random-number}.{extension}
```
Example: `product-image-1734567890123-987654321.jpg`

## Usage in Admin Panel

### Adding Product Images (New Product)
1. Open "Create Product" dialog
2. Fill in product name and select category (required)
3. Click the upload area or drag and drop images
4. Multiple images can be uploaded
5. Remove unwanted images by clicking the × button

### Editing Product Images (Existing Product)
1. Open "Edit Product" dialog
2. View existing images
3. Upload additional images using the upload area
4. Remove images as needed

### Upload States
- **Disabled**: When product name or category is not set
- **Uploading**: Shows "Uploading..." message while files are being processed
- **Complete**: Images appear in the grid immediately after upload

## Backend Implementation

### Upload Endpoint
```
POST /api/admin/upload-product-image
Content-Type: multipart/form-data

Fields:
- image: File (required)
- categoryName: String (required)
- productName: String (required)

Response:
{
  "success": true,
  "imageUrl": "/storage/uploads/category/product/filename.jpg",
  "filename": "filename.jpg"
}
```

### Static File Serving
Images are served as static files from `/storage/uploads/` path.

Example: 
```
http://localhost:3000/storage/uploads/boxer-briefs/classic-brief/image-123.jpg
```

## Technical Details

### Dependencies
- **multer**: Handles multipart/form-data file uploads
- **@types/multer**: TypeScript types for multer

### Files Modified
- `server/uploadService.ts`: Upload configuration and helpers
- `server/routes.ts`: Upload endpoint
- `server/index.ts`: Static file serving
- `client/src/components/admin/dialogs/AddProductDialog.tsx`: File upload UI
- `client/src/components/admin/dialogs/EditProductDialog.tsx`: File upload UI
- `client/src/pages/AdminFixed.tsx`: Removed URL input state management

### Migration from URL Input
The previous URL-based image system has been replaced with file uploads:
- ❌ Old: Paste external image URLs
- ✅ New: Upload images directly

## Git Configuration
The `.gitignore` file is configured to:
- Ignore all uploaded files: `storage/uploads/*`
- Keep directory structure: `!storage/uploads/.gitkeep`

## Future Enhancements
Potential improvements:
1. Image compression/optimization on upload
2. Bulk image delete when product is deleted
3. Image cropping/editing before upload
4. CDN integration for better performance
5. Image format conversion (e.g., auto-convert to WebP)
