const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Checking existing user...');
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: 'aryansondharva25@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        created_at: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
    console.log(`   Created: ${user.created_at}`);
    
    // Test password verification with common passwords
    const testPasswords = [
      'password',
      '123456',
      'admin',
      'test',
      'aryan',
      'sondharva'
    ];
    
    console.log('\n🔐 Testing password verification:');
    for (const testPwd of testPasswords) {
      const isValid = await bcrypt.compare(testPwd, user.password);
      console.log(`   "${testPwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
    }
    
    // Create a test password hash
    const testPassword = 'test123';
    const testHash = await bcrypt.hash(testPassword, 12);
    console.log(`\n🔧 Test hash for "${testPassword}": ${testHash}`);
    
    const testVerify = await bcrypt.compare(testPassword, testHash);
    console.log(`   Verification: ${testVerify ? '✅ Works' : '❌ Failed'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
