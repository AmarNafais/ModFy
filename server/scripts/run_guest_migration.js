#!/usr/bin/env node
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';

dotenv.config();

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'Complex123';
  const database = process.env.DB_NAME || 'modfy';

  console.log(`Connecting to ${user}@${host}/${database} ...`);
  const conn = await mysql.createConnection({ host, user, password, database, multipleStatements: true });
  try {
    // 1) Create guest_customers table
    console.log('Creating guest_customers table if not exists...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS guest_customers (
        id VARCHAR(255) PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT,
        phone_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('guest_customers table ready.');

    // 2) Add guest_customer_id column if missing
    const [cols] = await conn.execute(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'guest_customer_id'`,
      [database]
    );
    const colCount = (Array.isArray(cols) && cols[0] && cols[0].cnt) ? Number(cols[0].cnt) : 0;
    if (colCount === 0) {
      console.log('Adding guest_customer_id column to orders...');
      await conn.execute(`ALTER TABLE orders ADD COLUMN guest_customer_id VARCHAR(255) NULL`);
      console.log('guest_customer_id column added.');
    } else {
      console.log('guest_customer_id column already exists; skipping ADD COLUMN.');
    }

    // 3) Insert unique guest customers from orders (group by email)
    console.log('Backfilling guest_customers from orders.delivery_address where email present...');
    await conn.execute(
      `INSERT INTO guest_customers (id, email, full_name, phone_number, created_at)
       SELECT UUID(),
              JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.email')) AS email,
              JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.fullName')) AS full_name,
              JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.phoneNumber')) AS phone_number,
              NOW()
       FROM orders
       WHERE JSON_EXTRACT(delivery_address, '$.email') IS NOT NULL
       GROUP BY JSON_UNQUOTE(JSON_EXTRACT(delivery_address, '$.email'))
      `
    );
    console.log('Backfill insert complete.');

    // 4) Update orders to reference guest_customers by matching email
    console.log('Updating orders.guest_customer_id from guest_customers...');
    await conn.execute(
      `UPDATE orders
       SET guest_customer_id = (
         SELECT gc.id FROM guest_customers gc WHERE gc.email = JSON_UNQUOTE(JSON_EXTRACT(orders.delivery_address, '$.email')) LIMIT 1
       )
       WHERE JSON_EXTRACT(delivery_address, '$.email') IS NOT NULL`
    );
    console.log('Orders updated.');

    // 5) Add foreign key if not exists
    const [fkRows] = await conn.execute(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'fk_orders_guest_customer'`,
      [database]
    );
    const fkCount = (Array.isArray(fkRows) && fkRows[0] && fkRows[0].cnt) ? Number(fkRows[0].cnt) : 0;
    if (fkCount === 0) {
      try {
        console.log('Adding foreign key constraint fk_orders_guest_customer...');
        await conn.execute(`ALTER TABLE orders ADD CONSTRAINT fk_orders_guest_customer FOREIGN KEY (guest_customer_id) REFERENCES guest_customers(id)`);
        console.log('Foreign key added.');
      } catch (fkErr) {
        console.warn('Could not add foreign key constraint (this may be fine depending on engine/permissions):', fkErr.message || fkErr);
      }
    } else {
      console.log('Foreign key fk_orders_guest_customer already exists; skipping.');
    }

    console.log('Guest customers migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exitCode = 2;
  } finally {
    await conn.end();
  }
}

run();
