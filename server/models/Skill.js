const mongoose = require('mongoose');

const skillCategories = [
  'Programming',
  'Web Development',
  'App Development',
  'UI/UX Design',
  'Database Management',
  'Data Science',
  'Graphic Design',
  'Communication Skills',
  'Video Editing',
  'Aptitude and Interview Preparation',
];

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide skill name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a skill category'],
      enum: skillCategories,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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

skillSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model('Skill', skillSchema);
module.exports.SKILL_CATEGORIES = skillCategories;
