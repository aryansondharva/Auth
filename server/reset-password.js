const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔧 Resetting user password...');
    
    const userEmail = 'aryansondharva25@gmail.com';
    const newPassword = 'test123'; // You can change this
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true
      }
    });
    
    console.log('✅ Password reset successfully!');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   New password: ${newPassword}`);
    console.log('\n🔑 You can now login with:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Password: ${newPassword}`);
    
    // Test the new password
    const testUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { password: true }
    });
    
    const isValid = await bcrypt.compare(newPassword, testUser.password);
    console.log(`\n🔐 Password verification test: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
