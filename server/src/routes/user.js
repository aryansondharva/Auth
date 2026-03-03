const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { getUserIdChangeHistory, changeUserId, uploadProfilePhoto, getProfilePhoto, deleteProfilePhoto, updateProfile, updateOnlineStatus, upload } = require('../controllers/userController');

const router = express.Router();

// Middleware to protect all routes
router.use(protect);

// Validation rules
const userIdValidation = [
  body('newUserId')
    .isLength({ min: 3, max: 50 })
    .withMessage('User ID must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('User ID can only contain letters, numbers, underscores, and hyphens')
    .not().matches(/^[0-9]/)
    .withMessage('User ID cannot start with a number')
];

const profileValidation = [
  body('bio')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('location')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('github')
    .optional({ checkFalsy: true })
    .isLength({ max: 39 })
    .withMessage('GitHub username must be less than 39 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('GitHub username can only contain letters, numbers, underscores, and hyphens'),
  body('twitter')
    .optional({ checkFalsy: true })
    .isLength({ max: 15 })
    .withMessage('Twitter username must be less than 15 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Twitter username can only contain letters, numbers, underscores, and hyphens'),
  body('linkedin')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('LinkedIn username must be less than 100 characters'),
  body('website')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true; // Allow empty values
      // Basic URL validation - more lenient
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(value)) {
        throw new Error('Website must be a valid URL');
      }
      return true;
    })
];

// Profile photo routes
router.get('/profile-photo', getProfilePhoto);
router.post('/profile-photo', upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/profile-photo', deleteProfilePhoto);

// Profile routes
router.put('/profile', profileValidation, updateProfile);
router.put('/online-status', updateOnlineStatus);

// User ID routes
router.get('/id-change-history', getUserIdChangeHistory);
router.post('/change-id', userIdValidation, changeUserId);

module.exports = router;
