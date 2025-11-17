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
  const migrationPath = path.join(__dirname, 'backend/database/migrations/033_add_word_limit_to_publications.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 033_add_word_limit_to_publications.sql executed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();