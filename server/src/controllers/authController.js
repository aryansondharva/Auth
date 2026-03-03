const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

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
const getUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { username }
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

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate username automatically
    const baseUsername = generateUsername(name, email);
    const username = await getUniqueUsername(baseUsername);

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with auto-generated username
    let userData = {
      name,
      email,
      password: hashedPassword
    };

    // Try to include username if field exists
    try {
      userData.username = username;
    } catch (error) {
      console.log('Username field not found, skipping...');
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true
      }
    });

    // Add username to response if it was generated
    try {
      user.username = username;
    } catch (error) {
      user.username = null;
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user with all profile fields
    const userResponse = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      location: user.location,
      github: user.github,
      twitter: user.twitter,
      linkedin: user.linkedin,
      website: user.website,
      isOnline: user.isOnline,
      lastActive: user.lastActive,
      created_at: user.created_at
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      location: user.location,
      github: user.github,
      twitter: user.twitter,
      linkedin: user.linkedin,
      website: user.website,
      isOnline: user.isOnline,
      lastActive: user.lastActive,
      created_at: user.created_at
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

const getMe = async (req, res) => {
  try {
    console.log('getMe - User data:', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilePhoto: req.user.profilePhoto,
      username: req.user.username
    });
    
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
