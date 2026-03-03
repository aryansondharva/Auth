const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📋 Database URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@'));
    
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL Version:', result[0].version);
    
    // Check users table
    const userCount = await prisma.user.count();
    console.log('👥 Users in database:', userCount);
    
    await prisma.$disconnect();
    console.log('🔌 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication failed. Check your DATABASE_URL credentials:');
      console.log('   - Username: postgres (or your PostgreSQL username)');
      console.log('   - Password: Your PostgreSQL password');
      console.log('   - Database: authdb');
      console.log('   - Host: localhost');
      console.log('   - Port: 5432');
    }
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 Database server not running. Start PostgreSQL:');
      console.log('   - Windows: Check Services for PostgreSQL service');
      console.log('   - Docker: docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres');
      console.log('   - Or install PostgreSQL from postgresql.org');
    }
    
    process.exit(1);
  }
}

testConnection();
