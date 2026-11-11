const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getUsers);
router.put('/profile', protect, updateProfile);
router.get('/:id', getUserById);
router.put('/:id/status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
