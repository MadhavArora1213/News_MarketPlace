require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migration: Add approval columns to podcasters table');

    const sql = `
      -- Add approval-related columns to podcasters table
      ALTER TABLE podcasters
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES admins(id),
      ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS rejected_by INTEGER REFERENCES admins(id),
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
      ADD COLUMN IF NOT EXISTS admin_comments TEXT;
    `;

    await client.query(sql);
    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();