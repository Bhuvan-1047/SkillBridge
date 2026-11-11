const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teacherId: {
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
    message: {
      type: String,
      required: [true, 'Please provide an introductory message'],
      trim: true,
    },
    learningObjective: {
      type: String,
      required: [true, 'Please state your specific learning objective'],
      trim: true,
    },
    preferredDate: {
      type: Date,
      required: [true, 'Please choose a preferred session date'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Please choose a preferred session time'],
      trim: true,
    },
    duration: {
      type: String,
      default: '60 mins',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests for the same learner, teacher, and skill
requestSchema.index(
  { learnerId: 1, teacherId: 1, skillId: 1, status: 1 }
);

module.exports = mongoose.model('Request', requestSchema);
