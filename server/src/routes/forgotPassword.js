const express = require('express');
const { body } = require('express-validator');
const { requestPasswordReset, verifyOTP, resetPassword } = require('../controllers/forgotPasswordController');

const router = express.Router();

// Validation rules
const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const otpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('resetToken')
    .isLength({ min: 32, max: 32 })
    .isHexadecimal()
    .withMessage('Invalid reset token'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Routes
router.post('/request', emailValidation, requestPasswordReset);
router.post('/verify-otp', otpValidation, verifyOTP);
router.post('/reset', resetPasswordValidation, resetPassword);

module.exports = router;
