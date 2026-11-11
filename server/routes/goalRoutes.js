const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyGoalAndProgress, updateMyGoal } = require('../controllers/goalController');

router.use(protect);

router.get('/my-progress', getMyGoalAndProgress);
router.put('/', updateMyGoal);

module.exports = router;
