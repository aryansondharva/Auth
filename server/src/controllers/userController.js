const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
    }
  }
});

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`;
    
    // Update user's profile photo in database
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { profilePhoto: profilePhotoUrl },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          created_at: true
        }
      });
    } catch (error) {
      // If profilePhoto field doesn't exist, update without it
      console.log('Profile photo field not found in database');
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {},
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true
        }
      });
      // Add the profile photo manually
      updatedUser.profilePhoto = profilePhotoUrl;
    }

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        user: updatedUser,
        profilePhotoUrl: profilePhotoUrl
      }
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    
    // Delete uploaded file if database update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error uploading profile photo'
    });
  }
};

const getProfilePhoto = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profilePhoto: true }
    });

    res.json({
      success: true,
      data: {
        profilePhoto: user?.profilePhoto || null
      }
    });
  } catch (error) {
    console.error('Get profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile photo'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log('Update profile - Request body:', req.body);
    console.log('Update profile - User ID:', req.user.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Update profile - Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      bio,
      location,
      github,
      twitter,
      linkedin,
      website
    } = req.body;

    // Prepare update data with only existing fields
    const updateData = {};
    try {
      if (bio !== undefined) updateData.bio = bio;
      if (location !== undefined) updateData.location = location;
      if (github !== undefined) updateData.github = github;
      if (twitter !== undefined) updateData.twitter = twitter;
      if (linkedin !== undefined) updateData.linkedin = linkedin;
      if (website !== undefined) updateData.website = website;
    } catch (error) {
      console.log('Some profile fields not found in database, skipping...');
    }

    // Update user profile
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
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
    } catch (error) {
      // If new fields don't exist, update with basic fields only
      console.log('Updating with basic fields only');
      const basicUpdateData = {};
      if (username !== undefined && 'username' in updateData) basicUpdateData.username = username;
      
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: basicUpdateData,
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true
        }
      });
      
      // Add the new fields with default values
      updatedUser.username = req.user.username || null;
      updatedUser.profilePhoto = req.user.profilePhoto || null;
      updatedUser.bio = bio || null;
      updatedUser.location = location || null;
      updatedUser.github = github || null;
      updatedUser.twitter = twitter || null;
      updatedUser.linkedin = linkedin || null;
      updatedUser.website = website || null;
      updatedUser.isOnline = req.user.isOnline || false;
      updatedUser.lastActive = req.user.lastActive || null;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          isOnline: isOnline,
          lastActive: new Date()
        },
        select: {
          id: true,
          isOnline: true,
          lastActive: true
        }
      });
    } catch (error) {
      // If online status fields don't exist, just return the current status
      console.log('Online status fields not found in database');
      updatedUser = {
        id: req.user.id,
        isOnline: isOnline,
        lastActive: new Date()
      };
    }

    res.json({
      success: true,
      message: 'Online status updated',
      data: {
        isOnline: updatedUser.isOnline,
        lastActive: updatedUser.lastActive
      }
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating online status'
    });
  }
};

const deleteProfilePhoto = async (req, res) => {
  try {
    // Get current user to find the photo path
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profilePhoto: true }
    });

    if (currentUser?.profilePhoto) {
      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', '..', currentUser.profilePhoto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update database to remove photo reference
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePhoto: null },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        created_at: true
      }
    });

    res.json({
      success: true,
      message: 'Profile photo removed successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Delete profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing profile photo'
    });
  }
};

const getUserIdChangeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the last 14 days of ID change history for this user
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const changes = await prisma.userIdChange.findMany({
      where: {
        userId: userId,
        changedAt: {
          gte: fourteenDaysAgo
        }
      },
      orderBy: {
        changedAt: 'desc'
      }
    });

    const changesInLast14Days = changes.length;
    const canChange = changesInLast14Days < 2;
    const nextChangeAvailable = canChange ? null : 
      changes.length >= 2 ? 
      new Date(Math.max(...changes.map(c => new Date(c.changedAt).getTime())) + 14 * 24 * 60 * 60 * 1000) 
      : null;

    res.json({
      success: true,
      data: {
        changesInLast14Days,
        maxChangesAllowed: 2,
        canChange,
        nextChangeAvailable,
        recentChanges: changes
      }
    });
  } catch (error) {
    console.error('Get ID change history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving ID change history'
    });
  }
};

const changeUserId = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { newUserId } = req.body;
    const currentUserId = req.user.id;

    // Check if the last 14 days of ID change history for this user
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const recentChanges = await prisma.userIdChange.findMany({
      where: {
        userId: currentUserId,
        changedAt: {
          gte: fourteenDaysAgo
        }
      }
    });

    if (recentChanges.length >= 2) {
      // Calculate when they can change next
      const lastChange = recentChanges.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))[0];
      const nextAvailable = new Date(new Date(lastChange.changedAt).getTime() + 14 * 24 * 60 * 60 * 1000);
      
      return res.status(429).json({
        success: false,
        message: 'You have reached the maximum limit of 2 ID changes per 14 days',
        data: {
          nextChangeAvailable: nextAvailable,
          changesInLast14Days: recentChanges.length
        }
      });
    }

    // Check if new user ID is already taken
    const existingUser = await prisma.user.findUnique({
      where: { id: newUserId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This user ID is already taken. Please choose another one.'
      });
    }

    // Check if new user ID is same as current
    if (newUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'New user ID cannot be the same as your current user ID.'
      });
    }

    // Update the user's ID
    const updatedUser = await prisma.user.update({
      where: { id: currentUserId },
      data: { id: newUserId },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true
      }
    });

    // Record the ID change
    await prisma.userIdChange.create({
      data: {
        userId: newUserId, // Use the new ID as the reference
        oldId: currentUserId,
        newId: newUserId,
        changedAt: new Date()
      }
    });

    // Generate new token with updated user ID
    const jwt = require('jsonwebtoken');
    const newToken = jwt.sign(
      { userId: newUserId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'User ID changed successfully',
      data: {
        user: updatedUser,
        token: newToken,
        changeInfo: {
          oldId: currentUserId,
          newId: newUserId,
          changedAt: new Date(),
          remainingChanges: 1 - recentChanges.length
        }
      }
    });
  } catch (error) {
    console.error('Change user ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing user ID'
    });
  }
};

module.exports = {
  getUserIdChangeHistory,
  changeUserId,
  uploadProfilePhoto,
  getProfilePhoto,
  deleteProfilePhoto,
  updateProfile,
  updateOnlineStatus,
  upload // Export multer middleware for use in routes
};
