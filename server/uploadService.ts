import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create base uploads directory
const baseUploadDir = path.join(process.cwd(), 'storage', 'uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Always save product images under storage/uploads/men/<product>
    const productName = req.body.productName || 'unnamed';
    const sanitizedProduct = productName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const uploadPath = path.join(baseUploadDir, 'men', sanitizedProduct);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // No file size limit
});

// Configure storage for category images
const categoryStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Get category name from request body
    const categoryName = req.body.categoryName || 'uncategorized';
    
    // Sanitize folder name
    const sanitizedCategory = categoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Create directory path: storage/uploads/categories/category-name/
    const uploadPath = path.join(baseUploadDir, 'categories', sanitizedCategory);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
  }
});

// Configure multer for category uploads
export const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: fileFilter,
  // No file size limit
});

// Helper function to delete old product images
export async function deleteProductImages(categoryName: string, productName: string): Promise<void> {
  const sanitizedCategory = categoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const sanitizedProduct = productName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const productDir = path.join(baseUploadDir, sanitizedCategory, sanitizedProduct);
  
  if (fs.existsSync(productDir)) {
    fs.rmSync(productDir, { recursive: true, force: true });
  }
}

// Helper function to get image URL from file path
export function getImageUrl(filePath: string): string {
  // Convert absolute path to relative URL
  const relativePath = path.relative(process.cwd(), filePath);
  // Replace backslashes with forward slashes for URL
  return '/' + relativePath.replace(/\\/g, '/');
}
