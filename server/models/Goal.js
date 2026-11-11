const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    targetWeeklySessions: {
      type: Number,
      default: 2,
      min: 1,
      max: 20,
    },
    targetWeeklyHours: {
      type: Number,
      default: 2,
      min: 1,
      max: 40,
    },
    targetSkills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          default: 'General',
          trim: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: {
      type: String,
      default: '',
      maxlength: 300,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);
