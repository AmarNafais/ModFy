import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'mysql',
  password: 'Complex123',
  database: 'modfy',
});

async function checkDb() {
  try {
    const [tables] = await pool.execute("SHOW TABLES");
    console.log('\n=== TABLES ===');
    console.log(tables);

    // Check categories columns
    const [catCols] = await pool.execute("SHOW COLUMNS FROM categories");
    console.log('\n=== CATEGORIES COLUMNS ===');
    catCols.forEach(col => console.log(col.Field));

    // Check products columns  
    const [prodCols] = await pool.execute("SHOW COLUMNS FROM products");
    console.log('\n=== PRODUCTS COLUMNS ===');
    prodCols.forEach(col => console.log(col.Field));

    // Check orders columns
    const [orderCols] = await pool.execute("SHOW COLUMNS FROM orders");
    console.log('\n=== ORDERS COLUMNS ===');
    orderCols.forEach(col => console.log(col.Field));

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDb();
