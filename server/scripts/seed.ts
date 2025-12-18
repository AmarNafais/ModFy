import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Complex123',
    database: process.env.DB_NAME || 'modfy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if data already exists
    const [existingUsers] = await connection.execute('SELECT id FROM users LIMIT 1');
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log('Database already has data. Skipping seed...');
      console.log('To re-seed, first clear the database tables.');
      return;
    }

    console.log('Seeding database...');
    
    // Create admin user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Password123", saltRounds);
    
    await connection.execute(
      `INSERT INTO users 
      (id, email, password, first_name, last_name, role, is_email_verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["admin-user-id", "admin@modfy.lk", hashedPassword, "Admin", "User", "admin", 1]
    );
    console.log('✓ Created admin user');

    console.log('\n✓ Database seeded successfully!');
    console.log('\nSeeded data:');
    console.log('  - 1 admin user (admin@modfy.lk / Password123)');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
    process.exit(0);
  }
}

seed();
