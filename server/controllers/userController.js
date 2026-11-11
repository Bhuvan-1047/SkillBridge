const User = require('../models/User');
const SkillListing = require('../models/SkillListing');
const Session = require('../models/Session');
const Review = require('../models/Review');

// @desc    Get all students (with search and filters)
// @route   GET /api/users
// @access  Public / Authenticated
const getUsers = async (req, res, next) => {
  try {
    const { search, college, department, role } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public student profile by ID with skills, stats, and reviews
// @route   GET /api/users/:id
// @access  Public / Authenticated
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name college department year bio profileImage role createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Fetch teaching skills and learning interests
    const teachingSkills = await SkillListing.find({
      userId: user._id,
      type: 'teach',
      isActive: true,
    }).populate('skillId', 'name category description');

    const learningSkills = await SkillListing.find({
      userId: user._id,
      type: 'learn',
      isActive: true,
    }).populate('skillId', 'name category description');

    // Count completed sessions
    const totalTeachingSessions = await Session.countDocuments({
      teacherId: user._id,
      status: 'Completed',
    });

    const totalLearningSessions = await Session.countDocuments({
      learnerId: user._id,
      status: 'Completed',
    });

    // Fetch reviews for this student
    const reviews = await Review.find({ revieweeId: user._id })
      .populate('reviewerId', 'name college department')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length
          ).toFixed(1)
        : null;

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        teachingSkills,
        learningSkills,
        totalTeachingSessions,
        totalLearningSessions,
        reviews,
        avgRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current logged-in student profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const { name, college, department, year, bio } = req.body;

    if (name) user.name = name;
    if (college) user.college = college;
    if (department) user.department = department;
    if (year) user.year = year;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        department: updatedUser.department,
        year: updatedUser.year,
        bio: updatedUser.bio,
        role: updatedUser.role,
        credits: updatedUser.credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Toggle user active status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Suspended'}`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  toggleUserStatus,
};
