require('dotenv').config();
const db = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    console.log(`📊 Config: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
    const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Database connection successful!');
    console.log(`⏰ Server time: ${result.rows[0].current_time}`);
    console.log(`🗄️ PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    
    // Check if powerlist_nominations table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'powerlist_nominations'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ powerlist_nominations table exists');
      
      const countResult = await db.query('SELECT COUNT(*) FROM powerlist_nominations');
      console.log(`📈 Current nominations count: ${countResult.rows[0].count}`);
    } else {
      console.log('⚠️ powerlist_nominations table does not exist');
      console.log('💡 Run migrations first: npm run migrate');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`Error code: ${error.code}`);
    console.error(`Error message: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting steps:');
      console.log('1. Check if PostgreSQL is installed');
      console.log('2. Start PostgreSQL service');
      console.log('3. Verify connection settings in .env file');
      console.log('4. Check if port 5432 is available');
      
      if (process.platform === 'win32') {
        console.log('5. Try running: net start postgresql (as administrator)');
      } else {
        console.log('5. Try running: sudo service postgresql start');
      }
    }
    
    process.exit(1);
  }
}

checkDatabase();
