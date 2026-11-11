const Goal = require('../models/Goal');
const Session = require('../models/Session');
const Skill = require('../models/Skill');

// Helper to get Monday 00:00 and Sunday 23:59 of current week
const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

// @desc    Get current user's learning goal & actual real-time progress
// @route   GET /api/goals/my-progress
// @access  Private
const getMyGoalAndProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    // 1. Find or create default goal
    let goal = await Goal.findOne({ userId });
    if (!goal) {
      goal = await Goal.create({
        userId,
        targetWeeklySessions: 2,
        targetWeeklyHours: 2,
        targetSkills: [
          { name: 'Python', category: 'Programming', completed: false },
          { name: 'React.js', category: 'Web Development', completed: false },
        ],
        notes: 'Consistent peer learning every week!',
      });
    }

    // 2. Find completed learning sessions for this user in the CURRENT WEEK
    const weeklySessions = await Session.find({
      $or: [{ learnerId: userId }, { teacherId: userId }],
      status: 'Completed',
      updatedAt: { $gte: startOfWeek, $lte: endOfWeek },
    })
      .populate('skillId', 'name category')
      .populate('teacherId', 'name college')
      .populate('learnerId', 'name college')
      .sort({ updatedAt: -1 });

    const completedWeeklyCount = weeklySessions.length;

    // Calculate approximate weekly hours completed
    let totalMinutesThisWeek = 0;
    weeklySessions.forEach((s) => {
      const match = s.duration && s.duration.match(/\d+/);
      const mins = match ? parseInt(match[0], 10) : 60;
      totalMinutesThisWeek += mins;
    });
    const hoursCompleted = Number((totalMinutesThisWeek / 60).toFixed(1));

    // Calculate completion percentages
    const sessionPercentage = Math.min(
      100,
      Math.round((completedWeeklyCount / (goal.targetWeeklySessions || 1)) * 100)
    );
    const hourPercentage = Math.min(
      100,
      Math.round((hoursCompleted / (goal.targetWeeklyHours || 1)) * 100)
    );

    // 3. Find ALL distinct skills learned across all time
    const allLearnedSessions = await Session.find({
      learnerId: userId,
      status: 'Completed',
    }).populate('skillId', 'name category');

    const learnedSkillMap = new Map();
    allLearnedSessions.forEach((s) => {
      if (s.skillId) {
        learnedSkillMap.set(s.skillId.name, {
          name: s.skillId.name,
          category: s.skillId.category || 'General',
          completedAt: s.updatedAt,
        });
      }
    });

    const learnedSkills = Array.from(learnedSkillMap.values());

    // Update completion flag on targetSkills if already learned
    const updatedTargetSkills = goal.targetSkills.map((ts) => ({
      name: ts.name,
      category: ts.category,
      completed: learnedSkillMap.has(ts.name),
    }));

    // Status label
    let statusLabel = 'In Progress';
    if (sessionPercentage >= 100) {
      statusLabel = 'Goal Achieved! 🎉';
    } else if (sessionPercentage >= 50) {
      statusLabel = 'On Track 🚀';
    } else if (completedWeeklyCount === 0) {
      statusLabel = 'Not Started';
    }

    res.json({
      success: true,
      goal: {
        _id: goal._id,
        targetWeeklySessions: goal.targetWeeklySessions,
        targetWeeklyHours: goal.targetWeeklyHours,
        targetSkills: updatedTargetSkills,
        notes: goal.notes,
        updatedAt: goal.updatedAt,
      },
      progress: {
        completedWeeklyCount,
        targetWeeklySessions: goal.targetWeeklySessions,
        sessionPercentage,
        hoursCompleted,
        targetWeeklyHours: goal.targetWeeklyHours,
        hourPercentage,
        statusLabel,
        startOfWeek,
        endOfWeek,
        learnedSkillsCount: learnedSkills.length,
        learnedSkills,
        weeklySessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's learning goals
// @route   PUT /api/goals
// @access  Private
const updateMyGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetWeeklySessions, targetWeeklyHours, targetSkills, notes } = req.body;

    let goal = await Goal.findOne({ userId });

    if (!goal) {
      goal = new Goal({ userId });
    }

    if (targetWeeklySessions !== undefined) {
      goal.targetWeeklySessions = Math.max(1, Math.min(20, Number(targetWeeklySessions)));
    }

    if (targetWeeklyHours !== undefined) {
      goal.targetWeeklyHours = Math.max(1, Math.min(40, Number(targetWeeklyHours)));
    }

    if (Array.isArray(targetSkills)) {
      goal.targetSkills = targetSkills.map((s) => (typeof s === 'string' ? { name: s.trim() } : s));
    }

    if (notes !== undefined) {
      goal.notes = notes.trim();
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Learning goals updated successfully',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyGoalAndProgress,
  updateMyGoal,
};
