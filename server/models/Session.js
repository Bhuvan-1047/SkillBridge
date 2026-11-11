const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },
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
    scheduledAt: {
      type: Date,
      required: [true, 'Please provide the agreed date and time'],
    },
    duration: {
      type: String,
      default: '60 mins',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Awaiting Confirmation', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    learnerConfirmed: {
      type: Boolean,
      default: false,
    },
    teacherConfirmed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
