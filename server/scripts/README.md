# Database Scripts

## Seeding

### Run Seeds Manually

```bash
npm run db:seed
```

This will:
- Check if data already exists (skips if users table has data)
- Create admin user: `admin@modfy.lk` / `Password123`
- Create 6 categories (Boxer Briefs, Briefs, Trunks, Performance, Luxury, Thermal)
- Create 2 collections (Essentials 2024, Luxury Series)
- Create 3 sample products
- Create 2 sample orders with items

### Clear Database Before Re-seeding

If you want to seed fresh data, first clear the tables:

```bash
# Option 1: Clear users table (triggers seed check to pass)
mysql -u mysql -p modfy -e "DELETE FROM users;"

# Option 2: Drop all tables and re-create schema
npm run db:push
```

Then run:
```bash
npm run db:seed
```

### Auto-seed on Server Startup

To enable automatic seeding when the server starts (useful for dev environments):

1. Add `AUTO_SEED=true` to your `.env` file
2. Start the server: `npm run dev`

**Note:** Auto-seed is disabled by default to prevent accidental data overwrites.

## Migration Workflow

1. **Make schema changes** in `shared/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Apply migration**: `npm run db:migrate`
4. **Seed data**: `npm run db:seed`

## Quick Start (Fresh Database)

```bash
# 1. Push schema to database
npm run db:push

# 2. Seed initial data
npm run db:seed

# 3. Start development server
npm run dev
```
