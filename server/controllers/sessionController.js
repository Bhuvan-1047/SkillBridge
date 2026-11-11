const Session = require('../models/Session');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Request = require('../models/Request');

// @desc    Get all sessions for current student (both teaching & learning)
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, role } = req.query;

    const query = {
      $or: [{ learnerId: userId }, { teacherId: userId }],
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (role === 'teacher') {
      delete query.$or;
      query.teacherId = userId;
    } else if (role === 'learner') {
      delete query.$or;
      query.learnerId = userId;
    }

    const sessions = await Session.find(query)
      .populate('learnerId', 'name college department year bio profileImage')
      .populate('teacherId', 'name college department year bio profileImage')
      .populate('skillId', 'name category')
      .sort({ scheduledAt: 1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session details by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('learnerId', 'name college department year bio')
      .populate('teacherId', 'name college department year bio')
      .populate('skillId', 'name category description')
      .populate('requestId', 'message learningObjective');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session record not found',
      });
    }

    // Verify user is participant or admin
    const isParticipant =
      session.learnerId._id.toString() === req.user._id.toString() ||
      session.teacherId._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this session',
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule session / update meeting details
// @route   PUT /api/sessions/:id/reschedule
// @access  Private
const updateSessionDetails = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session record not found',
      });
    }

    const isParticipant =
      session.learnerId.toString() === req.user._id.toString() ||
      session.teacherId.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Only session participants can update meeting details',
      });
    }

    if (session.status === 'Completed' || session.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify a session that is already ${session.status}`,
      });
    }

    const { scheduledAt, meetingLink, mode, duration } = req.body;

    if (scheduledAt) session.scheduledAt = new Date(scheduledAt);
    if (meetingLink !== undefined) session.meetingLink = meetingLink;
    if (mode) session.mode = mode;
    if (duration) session.duration = duration;

    // Reset confirmation status if rescheduled
    session.learnerConfirmed = false;
    session.teacherConfirmed = false;
    session.status = 'Scheduled';

    await session.save();

    // Notify other participant
    const otherUserId =
      session.learnerId.toString() === req.user._id.toString()
        ? session.teacherId
        : session.learnerId;

    await Notification.create({
      userId: otherUserId,
      title: 'Session Details Updated 📅',
      message: `${req.user.name} updated the meeting time or link for your upcoming session.`,
      type: 'session',
      link: '/dashboard/sessions',
    });

    res.json({
      success: true,
      message: 'Session updated successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm session completion & perform atomic credit transfer
// @route   PUT /api/sessions/:id/complete
// @access  Private
const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('skillId', 'name')
      .populate('learnerId', 'name email')
      .populate('teacherId', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session record not found',
      });
    }

    if (session.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This session has already been marked completed and credits transferred.',
      });
    }

    if (session.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled session',
      });
    }

    const isLearner = session.learnerId._id.toString() === req.user._id.toString();
    const isTeacher = session.teacherId._id.toString() === req.user._id.toString();

    if (!isLearner && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this session',
      });
    }

    // Mark confirmation for the acting user
    if (isLearner) {
      session.learnerConfirmed = true;
    }
    if (isTeacher) {
      session.teacherConfirmed = true;
    }

    // Check if BOTH participants have confirmed
    if (session.learnerConfirmed && session.teacherConfirmed) {
      // ==========================================
      // CORE CREDIT TRANSFER LOGIC (ATOMIC)
      // ==========================================
      const learner = await User.findById(session.learnerId._id);
      const teacher = await User.findById(session.teacherId._id);

      // 1. Learner: release reserved credit and record as spent
      learner.credits.reserved = Math.max(0, learner.credits.reserved - 1);
      learner.credits.spent += 1;
      await learner.save();

      // Transaction record for Learner
      await Transaction.create({
        userId: learner._id,
        sessionId: session._id,
        type: 'Spent credits',
        amount: -1,
        description: `Spent 1 credit for completed learning session in ${session.skillId.name} with ${teacher.name}`,
        referenceId: session._id.toString(),
      });

      // 2. Teacher: earn 1 credit into available wallet
      teacher.credits.available += 1;
      teacher.credits.earned += 1;
      await teacher.save();

      // Transaction record for Teacher
      await Transaction.create({
        userId: teacher._id,
        sessionId: session._id,
        type: 'Earned credits',
        amount: 1,
        description: `Earned 1 credit for successfully teaching ${session.skillId.name} to ${learner.name}`,
        referenceId: session._id.toString(),
      });

      // Update session status
      session.status = 'Completed';
      session.completedAt = new Date();
      await session.save();

      // Also mark underlying request as completed
      await Request.findByIdAndUpdate(session.requestId, { status: 'completed' });

      // Notifications for both students
      await Notification.create({
        userId: learner._id,
        title: 'Session Completed! 🎉',
        message: `Your learning session in "${session.skillId.name}" with ${teacher.name} is complete. 1 credit was transferred to your teacher. Don't forget to submit a review!`,
        type: 'credit',
        link: '/dashboard/sessions',
      });

      await Notification.create({
        userId: teacher._id,
        title: 'Credit Earned! 💰',
        message: `Congratulations! You earned 1 credit for teaching "${session.skillId.name}" to ${learner.name}. Your new available balance is ${teacher.credits.available}.`,
        type: 'credit',
        link: '/dashboard/wallet',
      });

      return res.json({
        success: true,
        message: 'Both participants confirmed! Session completed and 1 credit transferred to teacher.',
        session,
        isFullyCompleted: true,
      });
    } else {
      // Only one party has confirmed so far
      session.status = 'Awaiting Confirmation';
      await session.save();

      const otherUserId = isLearner ? session.teacherId._id : session.learnerId._id;
      const otherRole = isLearner ? 'teacher' : 'learner';

      await Notification.create({
        userId: otherUserId,
        title: 'Session Completion Awaiting Confirmation ⏳',
        message: `${req.user.name} confirmed the completion of your session in "${session.skillId.name}". Please confirm on your end to finalize credit transfer.`,
        type: 'session',
        link: '/dashboard/sessions',
      });

      return res.json({
        success: true,
        message: `Confirmation recorded! Awaiting confirmation from your ${otherRole}.`,
        session,
        isFullyCompleted: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a session and release reserved credits back to learner
// @route   PUT /api/sessions/:id/cancel
// @access  Private
const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('skillId', 'name')
      .populate('learnerId', 'name')
      .populate('teacherId', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session record not found',
      });
    }

    if (session.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed sessions cannot be cancelled',
      });
    }

    if (session.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Session is already cancelled',
      });
    }

    const isLearner = session.learnerId._id.toString() === req.user._id.toString();
    const isTeacher = session.teacherId._id.toString() === req.user._id.toString();

    if (!isLearner && !isTeacher && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this session',
      });
    }

    const { cancellationReason } = req.body;

    // ==========================================
    // REFUND RESERVED CREDIT TO LEARNER
    // ==========================================
    const learner = await User.findById(session.learnerId._id);
    if (learner && learner.credits.reserved > 0) {
      learner.credits.reserved -= 1;
      learner.credits.available += 1;
      await learner.save();

      // Log refund transaction
      await Transaction.create({
        userId: learner._id,
        sessionId: session._id,
        type: 'Refunded credits',
        amount: 1,
        description: `1 reserved credit refunded due to session cancellation (${cancellationReason || 'Cancelled by participant'})`,
        referenceId: session._id.toString(),
      });
    }

    session.status = 'Cancelled';
    session.cancelledAt = new Date();
    session.cancellationReason = cancellationReason || `Cancelled by ${req.user.name}`;
    await session.save();

    // Also update request status
    await Request.findByIdAndUpdate(session.requestId, { status: 'cancelled' });

    // Notify other participant
    const otherUserId = isLearner ? session.teacherId._id : session.learnerId._id;
    await Notification.create({
      userId: otherUserId,
      title: 'Session Cancelled ⚠️',
      message: `${req.user.name} cancelled the session for "${session.skillId.name}". Reason: ${session.cancellationReason}`,
      type: 'session',
      link: '/dashboard/sessions',
    });

    res.json({
      success: true,
      message: 'Session cancelled successfully. Reserved credit refunded to learner.',
      session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  updateSessionDetails,
  completeSession,
  cancelSession,
};
