const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"AuthSystem" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🔐 Password Reset OTP - AuthSystem',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #4F46E5;
              margin-bottom: 10px;
            }
            .otp-container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
              background: rgba(255, 255, 255, 0.2);
              padding: 15px;
              border-radius: 8px;
              display: inline-block;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .security-note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .expiry {
              font-weight: bold;
              color: #e74c3c;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 AuthSystem</div>
              <h1>Password Reset Request</h1>
            </div>
            
            <p>Hello,</p>
            <p>You requested to reset your password for your AuthSystem account. Use the OTP below to proceed:</p>
            
            <div class="otp-container">
              <h2>Your OTP Code</h2>
              <div class="otp-code">${otp}</div>
              <p>This OTP will expire in <span class="expiry">10 minutes</span></p>
            </div>
            
            <div class="security-note">
              <strong>🔒 Security Notice:</strong>
              <ul>
                <li>Never share this OTP with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>This OTP can only be used once</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions or didn't request this password reset, please contact our support team.</p>
            
            <div class="footer">
              <p>This is an automated message from AuthSystem</p>
              <p>© 2026 AuthSystem. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}:`, info.messageId);
    
    // Also log OTP for development/testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Development OTP for ${email}: ${otp}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Fallback to console for development
    console.log(`📧 Fallback OTP for ${email}: ${otp}`);
    console.log('🔧 In production, check email configuration');
    
    return false;
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email address',
      data: {
        email: email,
        expiresIn: 10 * 60 * 1000 // 10 minutes in milliseconds
      }
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset request'
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    console.log('🔍 OTP verification request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ OTP validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;
    
    console.log('📋 OTP verification data:', {
      email,
      otp: otp ? 'provided' : 'missing'
    });

    // Get stored OTP data
    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Check attempts (max 3 attempts)
    if (otpData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        remainingAttempts: 3 - otpData.attempts
      });
    }

    // OTP is valid, generate reset token
    const resetToken = crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 hex chars
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token (in production, store in database)
    otpStore.set(`reset_${email}`, {
      resetToken,
      resetTokenExpires,
      email
    });

    // Clear OTP
    otpStore.delete(email);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken,
        expiresIn: 15 * 60 * 1000 // 15 minutes
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying OTP'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    console.log('🔍 Reset password request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, resetToken, newPassword } = req.body;
    
    console.log('📋 Reset password data:', {
      email,
      resetToken: resetToken ? 'provided' : 'missing',
      newPassword: newPassword ? 'provided' : 'missing'
    });

    // Get reset token data
    const resetData = otpStore.get(`reset_${email}`);
    
    console.log('🔍 Reset token lookup:', {
      key: `reset_${email}`,
      found: !!resetData,
      allKeys: Array.from(otpStore.keys())
    });

    if (!resetData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if reset token has expired
    if (Date.now() > resetData.resetTokenExpires) {
      console.log('⏰ Reset token expired:', {
        now: Date.now(),
        expires: resetData.resetTokenExpires,
        expired: true
      });
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Verify reset token
    if (resetData.resetToken !== resetToken) {
      console.log('❌ Reset token mismatch:', {
        expected: resetData.resetToken,
        received: resetToken,
        match: false
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Clear reset token
    otpStore.delete(`reset_${email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    });
  }
};

// Helper function to clean expired OTPs (run periodically)
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt && now > value.expiresAt) {
      otpStore.delete(key);
    }
    if (value.resetTokenExpires && now > value.resetTokenExpires) {
      otpStore.delete(key);
    }
  }
};

// Clean up expired OTPs every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
  requestPasswordReset,
  verifyOTP,
  resetPassword
};
