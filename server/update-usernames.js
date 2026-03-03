const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate username from name or email
const generateUsername = (name, email) => {
  // Try to generate from name first
  if (name) {
    // Remove spaces and special characters, convert to lowercase
    const baseName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '');
    
    if (baseName.length >= 3) {
      return baseName;
    }
  }
  
  // Fallback to email prefix
  const emailPrefix = email.split('@')[0].toLowerCase();
  const cleanPrefix = emailPrefix.replace(/[^a-z0-9]/g, '');
  
  if (cleanPrefix.length >= 3) {
    return cleanPrefix;
  }
  
  // Last resort - generate random username
  return 'user' + Math.random().toString(36).substring(2, 8);
};

// Check if username is unique and add number if needed
const getUniqueUsername = async (baseUsername, excludeUserId = null) => {
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: { 
          username,
          id: { not: excludeUserId }
        }
      });
      
      if (!existingUser) {
        return username;
      }
      
      // If username exists, add number
      username = baseUsername + counter;
      counter++;
    } catch (error) {
      // If username field doesn't exist, return base username
      return baseUsername;
    }
  }
};

async function updateUsernames() {
  try {
    console.log('Updating usernames for existing users...');
    
    // Get all users
    let users;
    try {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { username: null },
            { username: '' }
          ]
        }
      });
    } catch (error) {
      // If username field doesn't exist, get all users
      console.log('Username field not found, getting all users...');
      users = await prisma.user.findMany();
    }
    
    console.log(`Found ${users.length} users to process`);
    
    for (const user of users) {
      const baseUsername = generateUsername(user.name, user.email);
      const uniqueUsername = await getUniqueUsername(baseUsername, user.id);
      
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { username: uniqueUsername }
        });
        
        console.log(`✓ Updated user ${user.email} -> username: ${uniqueUsername}`);
      } catch (error) {
        console.log(`⚠ Could not update username for ${user.email}: ${error.message}`);
      }
    }
    
    console.log('Username update completed!');
  } catch (error) {
    console.error('Error updating usernames:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsernames();
