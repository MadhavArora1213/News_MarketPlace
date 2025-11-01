const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../../database/migrations');
  }

  // Get all migration files
  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort by filename (001, 002, etc.)
    } catch (error) {
      console.error('Error reading migrations directory:', error);
      return [];
    }
  }

  // Run a single migration
  async runMigration(filename) {
    const filePath = path.join(this.migrationsPath, filename);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Running migration: ${filename}`);

      // Split by semicolon and execute each statement
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement);
        }
      }

      console.log(`✅ Migration ${filename} completed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Migration ${filename} failed:`, error);
      throw error;
    }
  }

  // Run all migrations
  async runAllMigrations() {
    const migrationFiles = this.getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('No migration files found');
      return;
    }

    console.log(`Found ${migrationFiles.length} migration(s) to run`);

    for (const filename of migrationFiles) {
      try {
        await this.runMigration(filename);
      } catch (error) {
        console.error(`Migration failed at ${filename}, stopping...`);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  }

  // Create migration table to track applied migrations (optional enhancement)
  async createMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await query(sql);
  }
}

module.exports = new MigrationRunner();