const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check if users table exists and count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      // Show first few users (without passwords)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true
        },
        take: 5
      });
      
      console.log('👥 Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    } else {
      console.log('⚠️  No users found in database!');
      console.log('💡 You need to register a user first before trying to login.');
    }
    
    // Test if user_id_changes table exists
    try {
      const changeCount = await prisma.userIdChange.count();
      console.log(`📈 User ID changes recorded: ${changeCount}`);
    } catch (error) {
      console.log('⚠️  user_id_changes table might not exist yet');
      console.log('💡 Run: npx prisma db push to create the table');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if PostgreSQL is running');
    console.log('   2. Verify DATABASE_URL in .env file');
    console.log('   3. Ensure database "authdb" exists');
    console.log('   4. Check username/password are correct');
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
