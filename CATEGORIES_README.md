# Hierarchical Category System Implementation

## Overview
This implementation adds a hierarchical category system with main categories and subcategories to the MODFY store. Categories can now have parent-child relationships, and the navigation menu displays them in a mega menu format.

## Category Structure

### Main Categories
- **MEN**
  - Underwear (Briefs, Boxers)
  - Vests
  - Pants
  - T-Shirts

- **WOMEN**
  - Panties
  - Vests

- **KIDS**
  - Boys (Underwear, Vests, Pants)
  - Girls (Panties, Vests)

- **SOCKS** (or UNIFORMS)
  - School (Top Class, Modfy, Customized)
  - Everyday (Pedlar Socks)
  - Specialty (Nursing Socks)

## Changes Made

### 1. Database Schema Updates
- **File**: `shared/schema.ts`
- Added `parentId` field to the categories table to support hierarchical relationships

### 2. Database Migrations
- **Migration 0004**: `migrations/0004_add_parent_category.sql`
  - Adds `parent_id` column to categories table
  - Creates index for better query performance

- **Migration 0005**: `migrations/0005_seed_categories.sql`
  - Seeds initial categories based on the new menu structure
  - Creates all main categories and subcategories

### 3. Admin Dashboard
- **File**: `client/src/pages/Admin.tsx`
- Added parent category selector when creating new categories
- Updated category table to show:
  - Category type (Main or Subcategory)
  - Parent category name
- Admin can now create both main categories and subcategories

### 4. Server Routes
- **File**: `server/routes.ts`
- Updated `/api/admin/categories` POST endpoint to accept `parentId`
- Categories are created with proper parent-child relationships

### 5. Navigation Menu
- **File**: `client/src/components/Header.tsx`
- Added mega menu that appears on hover over "SHOP"
- Displays main categories with their subcategories
- Clicking on any category navigates to shop page with category filter

## Running the Migrations

### Option 1: Using the Migration Script

To apply the database changes and seed the initial categories:

1. Make sure you have a `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=modfy_store
```

2. Run the migration script:
```bash
node server/scripts/run_category_migrations.js
```

### Option 2: Manual SQL Execution

If you prefer to run the migrations manually, execute these SQL files in order:

1. **Add parent_id column**: `migrations/0004_add_parent_category.sql`
```sql
ALTER TABLE categories ADD COLUMN parent_id VARCHAR(255) DEFAULT NULL;
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
```

2. **Seed categories**: `migrations/0005_seed_categories.sql`
   - This file contains all the INSERT statements for the initial categories

You can run these directly in your MySQL client or phpMyAdmin.

### Verification

After running the migrations, verify the setup:

```sql
-- Check that parent_id column exists
DESCRIBE categories;

-- Check main categories (no parent)
SELECT * FROM categories WHERE parent_id IS NULL;

-- Check subcategories with their parents
SELECT 
  c.name as category_name,
  p.name as parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL;
```

## Usage

### Admin Dashboard

1. Navigate to `/admin`
2. Go to "Product Types" tab
3. Click "Create Category"
4. Fill in:
   - Category Name
   - Parent Category (optional - leave blank for main category)
   - Description
   - Image URL
5. Click "Create Category"

### Navigation Menu

- Hover over "SHOP" in the header
- A mega menu will appear showing all main categories
- Each main category shows its subcategories
- Click on any category to filter products

## API Endpoints

### Get All Categories
```
GET /api/categories
```
Returns all categories with parent-child relationships

### Get Categories (Admin)
```
GET /api/admin/product-types
```
Returns all categories (admin only)

### Create Category
```
POST /api/admin/categories
Body: {
  name: string,
  description: string,
  imageUrl: string,
  parentId: string | null
}
```
Creates a new category with optional parent

## Features

✅ Hierarchical category structure (main + subcategories)
✅ Admin interface to create main and subcategories
✅ Mega menu navigation on hover
✅ Category filtering in shop page
✅ Database migrations for easy deployment
✅ Seeded initial categories

## Future Enhancements

- Edit/delete category functionality
- Drag-and-drop category reordering
- Category images in mega menu
- Multi-level subcategories (3+ levels)
- Category analytics and reporting
