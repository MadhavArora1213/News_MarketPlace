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

async function runSQL() {
  try {
    const sqlPath = path.join(__dirname, 'insert_sample_data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL insert script...');

    await pool.query(sql);

    console.log('✅ Sample data inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  } finally {
    await pool.end();
  }
}

runSQL();