import mysql from 'mysql2/promise';

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Complex123',
    database: 'modfy',
    multipleStatements: true
  });

  try {
    console.log('Running migration: 0007_add_subcategory_to_products.sql');
    
    const sql = `ALTER TABLE products ADD COLUMN subcategory_id VARCHAR(255) DEFAULT NULL AFTER category_id;`;
    
    await connection.execute(sql);
    
    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
