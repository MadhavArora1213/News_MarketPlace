require('dotenv').config({ path: './backend/.env' });
const migrationRunner = require('./backend/src/utils/migrationRunner');

async function runMigration() {
  try {
    await migrationRunner.runMigration('045_add_approval_columns_to_podcasters.sql');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await migrationRunner.close();
  }
}

runMigration();