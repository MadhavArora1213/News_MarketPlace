require('dotenv').config();
const { query } = require('./src/config/database');

(async () => {
  try {
    console.log('Clearing existing powerlist nominations data...');
    
    // Delete existing records
    const deleteResult = await query('DELETE FROM powerlist_nominations', []);
    console.log(`✅ Deleted ${deleteResult.rowCount} existing records`);
    
    // Reset the sequence if needed
    await query('ALTER SEQUENCE powerlist_nominations_id_seq RESTART WITH 1', []);
    console.log('✅ Reset ID sequence');
    
    console.log('Database is ready for population!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
})();