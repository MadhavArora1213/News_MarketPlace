const { query } = require('./src/config/database');
require('dotenv').config();

async function checkGroups() {
  try {
    const res = await query('SELECT * FROM groups');
    console.log('Groups:', res.rows);
  } catch (err) {
    console.error('Error fetching groups:', err);
  } finally {
    process.exit();
  }
}

checkGroups();
