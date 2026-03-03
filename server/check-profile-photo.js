const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfilePhotos() {
  try {
    console.log('Checking profile photos in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`ID: ${user.id}`);
      console.log(`Profile Photo: ${user.profilePhoto || 'NULL'}`);
    }
    
  } catch (error) {
    console.error('Error checking profile photos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfilePhotos();
