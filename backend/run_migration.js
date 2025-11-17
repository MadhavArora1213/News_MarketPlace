require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  const migrationPath = path.join(__dirname, 'database/migrations/036_make_user_id_nullable_in_article_submissions.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 036_make_user_id_nullable_in_article_submissions.sql executed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();