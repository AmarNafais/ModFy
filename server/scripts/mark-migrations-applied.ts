import mysql from 'mysql2/promise';

async function markMigrationsApplied() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'mysql',
    password: process.env.DB_PASSWORD || 'Complex123',
    database: process.env.DB_NAME || 'modfy',
  });

  try {
    const connection = await pool.getConnection();
    
    console.log('Creating Drizzle migrations tracking table...');
    
    // Create the tracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);
    
    // Mark base migration as applied (skip table creation)
    console.log('Marking 0000_clumsy_reaper as applied...');
    await connection.execute(`
      INSERT IGNORE INTO __drizzle_migrations (hash, created_at) 
      VALUES ('0000_clumsy_reaper', ?)
    `, [Date.now()]);
    
    console.log('✓ Migration tracking setup complete!');
    console.log('\nNow you can run: npm run db:migrate');
    console.log('This will only apply 0001_known_pestilence (adds 3 columns)');
    
    connection.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

markMigrationsApplied();
