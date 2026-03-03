const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { getUserIdChangeHistory, changeUserId, uploadProfilePhoto, getProfilePhoto, deleteProfilePhoto, upload } = require('../controllers/userController');

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

// Profile photo routes
router.get('/profile-photo', getProfilePhoto);
router.post('/profile-photo', upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/profile-photo', deleteProfilePhoto);

// User ID routes
router.get('/id-change-history', getUserIdChangeHistory);
router.post('/change-id', userIdValidation, changeUserId);

module.exports = router;
