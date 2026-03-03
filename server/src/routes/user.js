const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { getUserIdChangeHistory, changeUserId } = require('../controllers/userController');

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

// Routes
router.get('/id-change-history', getUserIdChangeHistory);
router.post('/change-id', userIdValidation, changeUserId);

module.exports = router;
