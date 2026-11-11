const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionById,
  updateSessionDetails,
  completeSession,
  cancelSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect); // All session routes require authentication

router.get('/', getSessions);
router.get('/:id', getSessionById);
router.put('/:id/reschedule', updateSessionDetails);
router.put('/:id/complete', completeSession);
router.put('/:id/cancel', cancelSession);

module.exports = router;
