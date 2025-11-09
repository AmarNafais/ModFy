-- Migration: create guest_customers table and link to orders

-- 1) Create guest_customers table
CREATE TABLE IF NOT EXISTS guest_customers (
  id VARCHAR(255) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2) Add guest_customer_id column to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS guest_customer_id VARCHAR(255) NULL;

-- 3) Insert unique guest customers from orders.delivery_address JSON (if email present)
INSERT INTO guest_customers (id, email, full_name, phone_number, created_at)
SELECT UUID(),
       JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.email')) AS email,
       JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.fullName')) AS full_name,
       JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.phoneNumber')) AS phone_number,
       NOW()
FROM orders
WHERE JSON_EXTRACT(delivery_address, '$.email') IS NOT NULL
GROUP BY JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.email'));

-- 4) Update orders to reference guest_customers by matching email
UPDATE orders
SET guest_customer_id = (
  SELECT gc.id FROM guest_customers gc WHERE gc.email = JSON_UNQUOTE(JSON_EXTRACT(orders.delivery_address, '$.email')) LIMIT 1
)
WHERE JSON_EXTRACT(delivery_address, '$.email') IS NOT NULL;

-- 5) Add foreign key constraint (optional - may fail if FK checks disabled or engine differences)
ALTER TABLE orders
  ADD CONSTRAINT IF NOT EXISTS fk_orders_guest_customer FOREIGN KEY (guest_customer_id) REFERENCES guest_customers(id);
