const Review = require('../models/Review');
const Session = require('../models/Session');
const Notification = require('../models/Notification');

// @desc    Submit peer review and rating after a completed session
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { sessionId, rating, teachingQuality, communication, comment } = req.body;
    const reviewerId = req.user._id;

    if (!sessionId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session ID, rating (1-5), and written comment',
      });
    }

    const session = await Session.findById(sessionId)
      .populate('learnerId', 'name')
      .populate('teacherId', 'name')
      .populate('skillId', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Only completed sessions can be reviewed
    if (session.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed sessions',
      });
    }

    // Must be actual participant
    const isLearner = session.learnerId._id.toString() === reviewerId.toString();
    const isTeacher = session.teacherId._id.toString() === reviewerId.toString();

    if (!isLearner && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this completed session',
      });
    }

    const revieweeId = isLearner ? session.teacherId._id : session.learnerId._id;

    // Prevent multiple reviews from the same reviewer for this session
    const existingReview = await Review.findOne({
      sessionId,
      reviewerId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this session',
      });
    }

    const review = await Review.create({
      sessionId,
      reviewerId,
      revieweeId,
      rating: Number(rating),
      teachingQuality: Number(teachingQuality || rating),
      communication: Number(communication || rating),
      comment: comment.trim(),
    });

    // Notify the recipient
    await Notification.create({
      userId: revieweeId,
      title: 'New Feedback Received ⭐',
      message: `${req.user.name} gave you a ${rating}-star rating for your "${session.skillId.name}" session!`,
      type: 'review',
      link: `/users/${revieweeId}`,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name college department')
      .populate('revieweeId', 'name college department');

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews received by a student
// @route   GET /api/reviews/:userId
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name college department year')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
          ).toFixed(1)
        : null;

    res.json({
      success: true,
      count: reviews.length,
      avgRating,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific session
// @route   GET /api/reviews/session/:sessionId
// @access  Private
const getSessionReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ sessionId: req.params.sessionId })
      .populate('reviewerId', 'name')
      .populate('revieweeId', 'name');

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getSessionReviews,
};
