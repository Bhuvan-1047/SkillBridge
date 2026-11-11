const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const Skill = require('./models/Skill');
const { seedDatabase } = require('./utils/seedData');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development requests
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SkillBridge API',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Mount modular API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/skill-listings', require('./routes/listingRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// Serve built React frontend if available
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed database if it's empty so viva/demo works instantly out of the box
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });

    return server;
  } catch (err) {
    console.error('Failed to initialize server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
