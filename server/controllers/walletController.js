const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Session = require('../models/Session');

// @desc    Get current user credit wallet balances
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('credits name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User wallet not found',
      });
    }

    res.json({
      success: true,
      wallet: {
        available: user.credits.available,
        reserved: user.credits.reserved,
        earned: user.credits.earned,
        spent: user.credits.spent,
        totalNet: user.credits.available + user.credits.reserved,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full credit transaction history for current user
// @route   GET /api/wallet/history
// @access  Private
const getTransactionHistory = async (req, res, next) => {
  try {
    const { limit = 50, type } = req.query;

    const query = { userId: req.user._id };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('sessionId', 'status scheduledAt mode')
      .populate('relatedUser', 'name college email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wallet summary & analytics
// @route   GET /api/wallet/summary
// @access  Private
const getWalletSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('credits');

    const totalTaught = await Session.countDocuments({
      teacherId: userId,
      status: 'Completed',
    });

    const totalLearned = await Session.countDocuments({
      learnerId: userId,
      status: 'Completed',
    });

    const upcomingSessionsCount = await Session.countDocuments({
      $or: [{ teacherId: userId }, { learnerId: userId }],
      status: { $in: ['Scheduled', 'Awaiting Confirmation'] },
    });

    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      summary: {
        credits: user.credits,
        totalTaught,
        totalLearned,
        upcomingSessionsCount,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donate credits to a peer student
// @route   POST /api/wallet/donate
// @access  Private
const donateCredits = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { recipientId, amount, message } = req.body;

    const donationAmount = parseInt(amount, 10);
    if (!donationAmount || donationAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be at least 1 credit.',
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a recipient student.',
      });
    }

    if (recipientId.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot donate credits to yourself.',
      });
    }

    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient student not found.',
      });
    }

    if (sender.credits.available < donationAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient available credits. You have ${sender.credits.available} credit(s) available.`,
      });
    }

    // Deduct from sender
    sender.credits.available -= donationAmount;
    sender.credits.spent += donationAmount;
    await sender.save();

    // Credit to recipient
    recipient.credits.available += donationAmount;
    recipient.credits.earned += donationAmount;
    await recipient.save();

    // Create Sender Transaction
    const senderTx = await Transaction.create({
      userId: sender._id,
      relatedUser: recipient._id,
      type: 'Donation sent',
      amount: -donationAmount,
      description: `Community credit donation sent to ${recipient.name}${message ? ': "' + message.trim() + '"' : ''}`,
    });

    // Create Recipient Transaction
    await Transaction.create({
      userId: recipient._id,
      relatedUser: sender._id,
      type: 'Donation received',
      amount: donationAmount,
      description: `Community credit donation received from ${sender.name}${message ? ': "' + message.trim() + '"' : ''}`,
    });

    // Notification for recipient
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: recipient._id,
      title: '🎁 Credit Donation Received!',
      message: `${sender.name} donated ${donationAmount} credit(s) to you. ${message ? '"' + message.trim() + '"' : 'Keep learning!'}`,
      type: 'credit',
      link: '/dashboard/wallet',
    });

    res.json({
      success: true,
      message: `Successfully donated ${donationAmount} credit(s) to ${recipient.name}!`,
      newBalance: sender.credits.available,
      transaction: senderTx,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallet,
  getTransactionHistory,
  getWalletSummary,
  donateCredits,
};
