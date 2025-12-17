-- Migration: add customer_email to orders (idempotent)

-- Add column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "orders";
SET @columnname = "customer_email";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1 AS 'Column already exists'",
  "ALTER TABLE orders ADD COLUMN customer_email TEXT NULL"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Optional: backfill customer_email from delivery_address JSON if it contains an email field
UPDATE orders
SET customer_email = JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.email'))
WHERE JSON_EXTRACT(delivery_address, '$.email') IS NOT NULL
  AND (customer_email IS NULL OR customer_email = '');
