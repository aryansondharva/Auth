# Email OTP Setup Guide

## 📧 Email Configuration for OTP System

This guide will help you set up email sending for the forgot password OTP system.

### 🔧 Environment Variables

Update your `.env` file with the following email configuration:

```env
# Email Configuration (for OTP)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

### 📧 Email Service Options

#### 1. Gmail (Recommended for Development)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
   - Use this password in `EMAIL_PASS`

#### 2. Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### 3. SendGrid (Production Recommended)
```env
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=YOUR_SENDGRID_API_KEY
```

#### 4. Custom SMTP
```env
EMAIL_SERVICE=custom
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

### 🚀 Installation

Install the required dependencies:

```bash
npm install nodemailer
```

### 🧪 Testing

1. Start your server:
```bash
npm run dev
```

2. Test the forgot password flow:
   - Go to `/forgot-password`
   - Enter your email
   - Check the console for OTP (development mode)
   - Check your email (production mode)

### 📱 Email Template Features

The email template includes:
- ✅ **Responsive design** - Works on all devices
- ✅ **Professional styling** - Modern, clean interface
- ✅ **Security notices** - Important safety information
- ✅ **Brand customization** - Easy to modify colors and logo
- ✅ **Expiration warning** - Clear time limit display

### 🔒 Security Best Practices

1. **Environment Variables**: Never commit email credentials to git
2. **App Passwords**: Use app passwords instead of main passwords
3. **Rate Limiting**: Consider implementing email rate limiting
4. **Fallback**: System falls back to console if email fails

### 🎨 Customization

#### Change Email Colors:
Edit the CSS in `forgotPasswordController.js`:

```javascript
.otp-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change these colors to match your brand */
}
```

#### Update Logo:
```javascript
<div class="logo">🔐 Your Brand Name</div>
```

#### Modify Footer:
```javascript
<div class="footer">
  <p>This is an automated message from Your App Name</p>
  <p>© 2026 Your Company. All rights reserved.</p>
</div>
```

### 📊 Production Considerations

1. **Email Service**: Use a reliable service like SendGrid or AWS SES
2. **Domain Verification**: Verify your domain for better deliverability
3. **SPF/DKIM Records**: Set up proper DNS records
4. **Monitoring**: Track email delivery rates and failures
5. **Fallback Service**: Have backup email providers

### 🐛 Troubleshooting

#### Common Issues:

1. **"Invalid login"**:
   - Check if 2FA is enabled
   - Use an App Password instead of main password

2. **"Connection timeout"**:
   - Check firewall settings
   - Verify SMTP host and port

3. **"Email not sending"**:
   - Verify credentials
   - Check email quota limits
   - Review error logs in console

#### Debug Mode:
Add this to your controller for debugging:

```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('Email config:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    secure: process.env.EMAIL_SECURE
  });
}
```

### 📈 Monitoring

Monitor your email sending with:

```javascript
// Add to your sendOTPEmail function
console.log(`Email sent to ${email} at ${new Date().toISOString()}`);
```

### 🔄 Next Steps

1. Configure your email service
2. Test with your own email address
3. Set up production email service
4. Monitor email deliverability
5. Customize email templates

Your OTP system is now ready to send professional emails! 🎉
