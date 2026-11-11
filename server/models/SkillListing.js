const mongoose = require('mongoose');

const skillListingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['teach', 'learn'],
      required: [true, 'Please specify listing type (teach or learn)'],
      index: true,
    },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: [true, 'Please specify proficiency level'],
      default: 'Intermediate',
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a brief description'],
      trim: true,
    },
    availability: {
      type: String,
      default: 'Flexible / As agreed',
      trim: true,
    },
    sessionDuration: {
      type: String,
      default: '45-60 mins',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'online',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active listings of the same type for the same student and skill
skillListingSchema.index(
  { userId: 1, skillId: 1, type: 1, isActive: 1 },
  { unique: true }
);

module.exports = mongoose.model('SkillListing', skillListingSchema);
