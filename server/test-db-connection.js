const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing PostgreSQL Database Connection...\n');
  
  // Show environment variables (without sensitive data)
  console.log('📋 Environment Configuration:');
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    // Parse and show safe parts of the URL
    const url = new URL(dbUrl);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port}`);
    console.log(`   Database: ${url.pathname.substring(1)}`);
    console.log(`   Username: ${url.username}`);
    console.log(`   Password: ${url.password ? '***' : 'NOT SET'}\n`);
  } else {
    console.log('   ❌ DATABASE_URL not found in .env file\n');
    return;
  }

  const prisma = new PrismaClient();

  try {
    // Test basic connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Test query
    console.log('🔄 Testing database query...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query successful!');
    console.log(`📊 PostgreSQL Version: ${result[0].version}\n`);

    // Test if users table exists
    console.log('🔄 Checking if users table exists...');
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `;
      
      if (tableCheck[0].exists) {
        console.log('✅ Users table exists!\n');
        
        // Count users
        const userCount = await prisma.user.count();
        console.log(`📊 Current users in database: ${userCount}\n`);
        
        // Show table structure
        console.log('📋 Users table structure:');
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          ORDER BY ordinal_position
        `;
        
        columns.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'} ${col.column_default ? `(default: ${col.column_default})` : ''}`);
        });
        
      } else {
        console.log('❌ Users table does not exist!\n');
        console.log('💡 To create the table, run the SQL schema in pgAdmin4 or use:');
        console.log('   npx prisma db push\n');
      }
    } catch (error) {
      console.log('❌ Error checking users table:', error.message);
    }

    // Test creating a sample user (optional)
    console.log('\n🔄 Testing user creation...');
    const testUser = {
      id: 'test-connection-' + Date.now(),
      name: 'Test Connection',
      email: `test-${Date.now()}@example.com`,
      password: '$2b$10$test.hashed.password.for.connection.test'
    };

    try {
      const createdUser = await prisma.user.create({
        data: testUser
      });
      console.log('✅ Test user created successfully!');
      console.log(`📊 User ID: ${createdUser.id}`);
      
      // Clean up test user
      await prisma.user.delete({
        where: { id: createdUser.id }
      });
      console.log('🧹 Test user cleaned up\n');
      
    } catch (error) {
      console.log('❌ Error creating test user:', error.message);
    }

  } catch (error) {
    console.log('❌ Database connection failed!');
    console.log('🔍 Error details:', error.message);
    
    // Provide troubleshooting tips
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if PostgreSQL is running');
    console.log('   2. Verify DATABASE_URL in .env file');
    console.log('   3. Ensure database "authdb" exists');
    console.log('   4. Check username/password are correct');
    console.log('   5. Make sure PostgreSQL port 5432 is accessible');
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

testDatabaseConnection().catch(console.error);
