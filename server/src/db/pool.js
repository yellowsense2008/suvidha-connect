import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
