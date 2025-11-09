-- Migration: add customer_email to orders
ALTER TABLE orders
  ADD COLUMN customer_email TEXT NULL;

-- Optional: backfill customer_email from delivery_address JSON if it contains an email field
UPDATE orders
SET customer_email = JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.email'))
WHERE JSON_EXTRACT(delivery_address, '$.email') IS NOT NULL;
