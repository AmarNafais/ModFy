import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'mysql',
  password: process.env.DB_PASSWORD || 'Complex123',
  database: process.env.DB_NAME || 'modfy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;