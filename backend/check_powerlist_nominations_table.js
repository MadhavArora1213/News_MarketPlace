require('dotenv').config();
const { query } = require('./src/config/database');

(async () => {
  try {
    // Check if powerlist_nominations table exists
    console.log('Checking powerlist_nominations table...');
    
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'powerlist_nominations'
      ) as table_exists
    `, []);
    
    if (!tableCheck.rows[0].table_exists) {
      console.log('❌ powerlist_nominations table does not exist');
      console.log('Creating table...');
      
      // Create the table if it doesn't exist
      await query(`
        CREATE TABLE powerlist_nominations (
          id SERIAL PRIMARY KEY,
          publication_name VARCHAR(255) NOT NULL,
          website_url VARCHAR(500),
          power_list_name VARCHAR(255) NOT NULL,
          industry VARCHAR(100) NOT NULL,
          company_or_individual VARCHAR(50) NOT NULL,
          tentative_month VARCHAR(50),
          location_region VARCHAR(100),
          last_power_list_url VARCHAR(500),
          image VARCHAR(500),
          submitted_by INTEGER,
          status VARCHAR(50) DEFAULT 'pending',
          is_active BOOLEAN DEFAULT true,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ powerlist_nominations table created successfully');
    } else {
      console.log('✅ powerlist_nominations table exists');
      
      // Show table structure
      const structure = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'powerlist_nominations'
        ORDER BY ordinal_position
      `, []);
      
      console.log('\nTable structure:');
      structure.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
    
    // Show current count
    const countResult = await query('SELECT COUNT(*) as count FROM powerlist_nominations', []);
    console.log(`\nCurrent record count: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
})();