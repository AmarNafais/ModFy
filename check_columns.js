import mysql from 'mysql2/promise';

async function check() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'mysql',
    password: 'Complex123',
    database: 'modfy',
  });

  try {
    // Check if the 3 columns exist
    const [catCols] = await pool.execute("SHOW COLUMNS FROM categories");
    const hasParentId = catCols.some(col => col.Field === 'parent_id');
    
    const [orderCols] = await pool.execute("SHOW COLUMNS FROM orders");
    const hasCustomerEmail = orderCols.some(col => col.Field === 'customer_email');
    
    const [prodCols] = await pool.execute("SHOW COLUMNS FROM products");
    const hasSubcategoryId = prodCols.some(col => col.Field === 'subcategory_id');
    
    console.log('\n=== Migration Status ===');
    console.log('✓ Base tables created (0000_clumsy_reaper)');
    console.log('\nColumn additions (0001_known_pestilence):');
    console.log(hasParentId ? '✓ categories.parent_id EXISTS' : '✗ categories.parent_id MISSING');
    console.log(hasCustomerEmail ? '✓ orders.customer_email EXISTS' : '✗ orders.customer_email MISSING');
    console.log(hasSubcategoryId ? '✓ products.subcategory_id EXISTS' : '✗ products.subcategory_id MISSING');
    
    if (!hasParentId || !hasCustomerEmail || !hasSubcategoryId) {
      console.log('\n⚠️  Second migration not applied yet!');
      console.log('Run: npm run db:migrate');
    } else {
      console.log('\n✓ All migrations applied successfully!');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
