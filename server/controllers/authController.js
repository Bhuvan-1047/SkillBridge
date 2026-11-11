const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skillbridge_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      college,
      department,
      year,
      bio,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !college || !department || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required registration fields',
      });
    }

    // Password confirmation check
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address is already registered',
      });
    }

    // Create user with 3 initial credits
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      college,
      department,
      year,
      bio: bio || 'Eager to exchange skills on SkillBridge!',
      credits: {
        available: 3, // Initial gift for joining the platform
        reserved: 0,
        earned: 0,
        spent: 0,
      },
    });

    // Record initial welcome credit transaction in ledger
    await Transaction.create({
      userId: user._id,
      type: 'Initial credits',
      amount: 3,
      description: 'Welcome gift: 3 initial credits added upon registration',
    });

    // Create a welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to SkillBridge! 🎉',
      message:
        'You have received 3 free credits to begin learning from peers. Add your skills to start teaching and earning!',
      type: 'credit',
      link: '/dashboard/wallet',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
        bio: user.bio,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate student & get token
// @route   POST /api/auth/login
// @access  Public
const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
        bio: user.bio,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
        bio: user.bio,
        role: user.role,
        credits: user.credits,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout student
// @route   POST /api/auth/logout
// @access  Public
const logoutStudent = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  registerStudent,
  loginStudent,
  getCurrentUser,
  logoutStudent,
};
