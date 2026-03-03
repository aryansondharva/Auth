const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Running profile fields migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_profile_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement + ';');
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        // Ignore errors for columns that already exist
        if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
          console.log('⚠ Column already exists:', statement.substring(0, 50) + '...');
        } else {
          console.error('✗ Error executing statement:', error.message);
        }
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
