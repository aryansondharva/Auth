const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

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
  changeUserId
};
