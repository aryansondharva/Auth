const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded userId:', decoded.userId);
    
    // Get user from database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          profilePhoto: true,
          bio: true,
          location: true,
          github: true,
          twitter: true,
          linkedin: true,
          website: true,
          isOnline: true,
          lastActive: true,
          created_at: true
        }
      });
      
      // If no username exists, generate one from name/email
      if (user && !user.username) {
        const baseUsername = user.name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '') || user.email.split('@')[0].toLowerCase();
        
        user.username = baseUsername.length >= 3 ? baseUsername : 'user' + Math.random().toString(36).substring(2, 8);
      }
    } catch (error) {
      // If new fields don't exist, fall back to basic user selection
      console.log('New profile fields not found in database, using fallback');
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true
        }
      });
      
      // Add default values for new fields
      if (user) {
        // Generate username from name/email
        const baseUsername = user.name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '') || user.email.split('@')[0].toLowerCase();
        
        user.username = baseUsername.length >= 3 ? baseUsername : 'user' + Math.random().toString(36).substring(2, 8);
        user.profilePhoto = null;
        user.bio = null;
        user.location = null;
        user.github = null;
        user.twitter = null;
        user.linkedin = null;
        user.website = null;
        user.isOnline = false;
        user.lastActive = null;
      }
    }

    console.log('Auth middleware - User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Auth middleware - Error:', error.name);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

module.exports = {
  protect: authMiddleware
};
