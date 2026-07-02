const path = require('path');
const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '.env') });

if (dotenvResult.parsed) {
  Object.entries(dotenvResult.parsed).forEach(([key, value]) => {
    process.env[key] = value;
  });
}
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const { initSocket } = require('./config/socket');

// Route imports
const authRoutes = require('./routes/auth.routes');
const donorRoutes = require('./routes/donor.routes');
const requestRoutes = require('./routes/request.routes');
const trackingRoutes = require('./routes/tracking.routes');
const notificationRoutes = require('./routes/notification.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Initialize Socket.io
initSocket(server);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Red Drop AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🩸 Red Drop AI Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health\n`);
});

module.exports = { app, server };
