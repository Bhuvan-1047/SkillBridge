const express = require('express');
const router = express.Router();
const {
  getWallet,
  getTransactionHistory,
  getWalletSummary,
  donateCredits,
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.use(protect); // All wallet routes require authentication

router.get('/', getWallet);
router.get('/history', getTransactionHistory);
router.get('/summary', getWalletSummary);
router.post('/donate', donateCredits);

module.exports = router;
