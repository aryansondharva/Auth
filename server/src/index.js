const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
