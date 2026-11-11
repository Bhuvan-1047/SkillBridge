const Request = require('../models/Request');
const User = require('../models/User');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Skill = require('../models/Skill');

// @desc    Send a new learning request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const learnerId = req.user._id;
    const {
      teacherId,
      skillId,
      message,
      learningObjective,
      preferredDate,
      preferredTime,
      duration,
    } = req.body;

    if (!teacherId || !skillId || !message || !learningObjective || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required request details',
      });
    }

    // Prevent sending request to oneself
    if (learnerId.toString() === teacherId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a learning request to yourself',
      });
    }

    // Verify learner has at least 1 credit available
    const learner = await User.findById(learnerId);
    if (!learner || learner.credits.available < 1) {
      return res.status(400).json({
        success: false,
        message:
          'Insufficient credit balance. You need at least 1 credit to request a learning session. Earn credits by teaching fellow students!',
      });
    }

    // Prevent duplicate pending requests for the same learner, teacher, and skill
    const existingPending = await Request.findOne({
      learnerId,
      teacherId,
      skillId,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending learning request for this skill with this teacher',
      });
    }

    const request = await Request.create({
      learnerId,
      teacherId,
      skillId,
      message,
      learningObjective,
      preferredDate,
      preferredTime,
      duration: duration || '60 mins',
      status: 'pending',
    });

    // Fetch teacher & skill details to notify
    const skill = await Skill.findById(skillId);
    await Notification.create({
      userId: teacherId,
      title: 'New Learning Request! 🎓',
      message: `${learner.name} requested a learning session for "${skill ? skill.name : 'Skill'}".`,
      type: 'request',
      link: '/dashboard/requests',
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('learnerId', 'name college department year')
      .populate('teacherId', 'name college department year')
      .populate('skillId', 'name category');

    res.status(201).json({
      success: true,
      message: 'Learning request submitted successfully. Awaiting teacher approval.',
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming learning requests (Teacher view)
// @route   GET /api/requests/incoming
// @access  Private
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ teacherId: req.user._id })
      .populate('learnerId', 'name college department year bio profileImage')
      .populate('skillId', 'name category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get outgoing learning requests (Learner view)
// @route   GET /api/requests/outgoing
// @access  Private
const getOutgoingRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ learnerId: req.user._id })
      .populate('teacherId', 'name college department year bio profileImage')
      .populate('skillId', 'name category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher accepts a learning request (CORE CREDIT RESERVATION & SESSION CREATION)
// @route   PUT /api/requests/:id/accept
// @access  Private
const acceptRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const request = await Request.findById(requestId)
      .populate('skillId', 'name category')
      .populate('learnerId', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Learning request not found',
      });
    }

    // Only designated teacher can accept
    if (request.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requested teacher can accept this request',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    // Check learner's credit availability again at the time of acceptance
    const learner = await User.findById(request.learnerId._id);
    if (!learner || learner.credits.available < 1) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot accept request: The requesting student currently has insufficient available credits (0 credits).',
      });
    }

    // ==========================================
    // CORE CREDIT LOGIC: RESERVE 1 CREDIT
    // ==========================================
    learner.credits.available -= 1;
    learner.credits.reserved += 1;
    await learner.save();

    // Audit log transaction for credit reservation
    const transaction = await Transaction.create({
      userId: learner._id,
      type: 'Reserved credits',
      amount: -1,
      description: `1 credit reserved for upcoming learning session with ${req.user.name} (${request.skillId.name})`,
      referenceId: request._id.toString(),
    });

    // Create the active learning session
    const scheduledDateTime = new Date(request.preferredDate);
    const session = await Session.create({
      requestId: request._id,
      learnerId: request.learnerId._id,
      teacherId: req.user._id,
      skillId: request.skillId._id,
      scheduledAt: scheduledDateTime,
      duration: request.duration || '60 mins',
      mode: 'online',
      status: 'Scheduled',
    });

    // Link session to transaction for full traceability
    transaction.sessionId = session._id;
    await transaction.save();

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Notify learner of acceptance and credit reservation
    await Notification.create({
      userId: learner._id,
      title: 'Request Accepted! 🚀',
      message: `${req.user.name} accepted your request for "${request.skillId.name}". 1 credit has been reserved for the session.`,
      type: 'session',
      link: '/dashboard/sessions',
    });

    res.json({
      success: true,
      message: 'Request accepted. 1 credit reserved from student and session scheduled.',
      session,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher rejects a learning request
// @route   PUT /api/requests/:id/reject
// @access  Private
const rejectRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('skillId', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Learning request not found',
      });
    }

    if (request.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requested teacher can reject this request',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    request.status = 'rejected';
    await request.save();

    // Notify learner
    await Notification.create({
      userId: request.learnerId,
      title: 'Request Declined',
      message: `${req.user.name} was unable to accept your request for "${request.skillId ? request.skillId.name : 'Skill'}". No credits were deducted.`,
      type: 'request',
      link: '/dashboard/requests',
    });

    res.json({
      success: true,
      message: 'Request rejected. No credits were deducted.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Learner cancels a pending learning request
// @route   PUT /api/requests/:id/cancel
// @access  Private
const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Learning request not found',
      });
    }

    if (request.learnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requesting student can cancel this request',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending requests can be cancelled. Current status is ${request.status}`,
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
};
