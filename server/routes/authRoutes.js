const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getCurrentUser,
  logoutStudent,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/me', protect, getCurrentUser);
router.post('/logout', logoutStudent);

module.exports = router;
