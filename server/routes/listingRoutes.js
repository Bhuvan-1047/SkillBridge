const express = require('express');
const router = express.Router();
const {
  getSkillListings,
  createSkillListing,
  updateSkillListing,
  deleteSkillListing,
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

// Optional auth for getSkillListings so excludeUser can be used if token present
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getSkillListings);
router.post('/', protect, createSkillListing);
router.put('/:id', protect, updateSkillListing);
router.delete('/:id', protect, deleteSkillListing);

module.exports = router;
