# Database Setup Guide

## Current Status
- ✅ Schema defined in `shared/schema.ts`
- ✅ Database tables exist (created with `db:push`)
- ✅ Migration files cleaned up

## Approach: db:push (Development)

**Use this for development environments:**

```bash
# Sync schema changes directly to database
npm run db:push
```

**When to use:**
- Local development
- Testing schema changes
- Rapid prototyping

**Pros:**
- Fast and simple
- No migration files to manage
- Automatically handles differences

**Cons:**
- No migration history
- Can't deploy to production safely
- No way to rollback changes

---

## Approach: Migrations (Production)

**Use this for production deployments:**

### Fresh Database Setup

```bash
# 1. Generate migration from schema
npm run db:generate

# 2. Apply migrations
npm run db:migrate

# 3. Seed data
npm run db:seed
```

### Existing Database (CURRENT SITUATION)

Your database already has all tables. You have 2 options:

#### Option A: Reset and use migrations
```bash
# 1. Backup data first!
mysqldump -u mysql -p modfy > backup.sql

# 2. Drop all tables
mysql -u mysql -p modfy -e "DROP DATABASE modfy; CREATE DATABASE modfy;"

# 3. Run migrations
npm run db:migrate

# 4. Seed data
npm run db:seed
```

#### Option B: Mark migrations as applied (Skip table creation)
```bash
# Manually mark migrations as completed in __drizzle_migrations table
# This tells Drizzle "these migrations already ran"

# Create the migrations tracking table if it doesn't exist
mysql -u mysql -p modfy << EOF
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);

# Mark base migration as applied (prevents re-creating tables)
INSERT INTO __drizzle_migrations (hash, created_at) VALUES
('0000_clumsy_reaper', UNIX_TIMESTAMP() * 1000);

# Only apply the column additions
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id VARCHAR(255);
EOF
```

---

## Recommended Workflow

### For Your Current Situation:
1. **Continue using `db:push` for development**
2. **Delete migration files** (you don't need them with db:push)
3. **For production, start fresh with migrations**

### Going Forward:

**Development:**
```bash
# Make changes to schema.ts, then:
npm run db:push
```

**Production:**
```bash
# 1. Make changes to schema.ts
# 2. Generate migration
npm run db:generate

# 3. Test migration on staging
npm run db:migrate

# 4. Deploy to production
npm run db:migrate
```

---

## Commands Reference

```bash
npm run db:push      # Sync schema directly (dev only)
npm run db:generate  # Create migration file
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Drizzle Studio (DB GUI)
npm run db:seed      # Seed initial data
```

---

## Current Database State

Tables exist with all columns:
- ✅ users
- ✅ categories (with parent_id)
- ✅ products (with category_id, subcategory_id)
- ✅ collections
- ✅ collection_products
- ✅ cart_items
- ✅ orders (with customer_email)
- ✅ order_items
- ✅ wishlist_items
- ✅ user_profiles

All tables were created via `db:push`, so they match `schema.ts` exactly.
