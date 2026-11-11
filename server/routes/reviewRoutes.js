const express = require('express');
const router = express.Router();
const {
  createReview,
  getUserReviews,
  getSessionReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/:userId', getUserReviews);
router.get('/session/:sessionId', protect, getSessionReviews);

module.exports = router;
