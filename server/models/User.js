const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide student full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide student email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    college: {
      type: String,
      required: [true, 'Please specify your college name'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please specify your department'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Please specify your year of study'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'],
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: 'Eager to teach what I know and learn new skills!',
    },
    profileImage: {
      type: String,
      default: '',
    },
    credits: {
      available: {
        type: Number,
        default: 3, // Each newly registered student receives 3 initial credits
        min: 0,
      },
      reserved: {
        type: Number,
        default: 0,
        min: 0,
      },
      earned: {
        type: Number,
        default: 0,
        min: 0,
      },
      spent: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password using bcrypt before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for college filtering
userSchema.index({ college: 1 });

module.exports = mongoose.model('User', userSchema);
