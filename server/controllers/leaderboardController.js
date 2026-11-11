const User = require('../models/User');
const Session = require('../models/Session');
const Review = require('../models/Review');

// Helper to determine start of current month
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

const getBadgeForRank = (rank, sessionsTaught) => {
  if (sessionsTaught === 0) {
    return {
      name: 'Aspiring Teacher',
      tier: 'starter',
      icon: '🌱',
      label: 'Complete 1 teaching session to earn a badge',
      bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  if (rank === 1) {
    return {
      name: 'Gold Mentor',
      tier: 'gold',
      icon: '🥇',
      label: 'Rank #1 Top Teacher',
      bgColor: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  }
  if (rank === 2) {
    return {
      name: 'Silver Contributor',
      tier: 'silver',
      icon: '🥈',
      label: 'Rank #2 Top Contributor',
      bgColor: 'bg-slate-200 text-slate-800 border-slate-300',
    };
  }
  if (rank === 3) {
    return {
      name: 'Bronze Swapper',
      tier: 'bronze',
      icon: '🥉',
      label: 'Rank #3 Peer Swapper',
      bgColor: 'bg-orange-100 text-orange-900 border-orange-300',
    };
  }
  if (rank <= 10) {
    return {
      name: 'Community Star',
      tier: 'star',
      icon: '⭐',
      label: 'Top 10 Contributor',
      bgColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    };
  }

  return {
    name: 'Active Peer',
    tier: 'active',
    icon: '✨',
    label: 'Active Contributor',
    bgColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  };
};

// @desc    Get Top 10 Leaderboard, Monthly Rankings, and Current User Ranking
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const period = req.query.period === 'all' ? 'all' : 'monthly'; // default to monthly

    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const startOfMonth = getStartOfMonth();

    // 1. Fetch all active students
    const students = await User.find({ isActive: true, role: 'student' })
      .select('name college department year profileImage credits createdAt')
      .lean();

    // 2. Fetch completed sessions grouped by teacher
    const sessionMatch = { status: 'Completed' };
    if (period === 'monthly') {
      sessionMatch.updatedAt = { $gte: startOfMonth };
    }

    const completedSessions = await Session.find(sessionMatch)
      .select('teacherId duration updatedAt')
      .lean();

    // Session count map
    const teacherSessionMap = new Map();
    completedSessions.forEach((s) => {
      const tId = s.teacherId ? s.teacherId.toString() : null;
      if (tId) {
        teacherSessionMap.set(tId, (teacherSessionMap.get(tId) || 0) + 1);
      }
    });

    // 3. Fetch reviews to compute average teaching ratings
    const reviews = await Review.find().select('revieweeId rating').lean();
    const ratingMap = new Map();
    reviews.forEach((r) => {
      const uId = r.revieweeId ? r.revieweeId.toString() : null;
      if (uId) {
        if (!ratingMap.has(uId)) {
          ratingMap.set(uId, { sum: 0, count: 0 });
        }
        const curr = ratingMap.get(uId);
        curr.sum += r.rating;
        curr.count += 1;
      }
    });

    // 4. Combine student metrics and sort
    const rankedStudents = students.map((st) => {
      const idStr = st._id.toString();
      const sessionsTaught = teacherSessionMap.get(idStr) || 0;
      const rData = ratingMap.get(idStr);
      const avgRating = rData && rData.count > 0 ? Number((rData.sum / rData.count).toFixed(1)) : 5.0;
      const creditsEarned = st.credits?.earned || 0;

      // Composite score: sessions * 10 + creditsEarned * 2 + rating
      const score = sessionsTaught * 10 + creditsEarned * 2 + avgRating;

      return {
        _id: st._id,
        name: st.name,
        college: st.college,
        department: st.department,
        year: st.year,
        profileImage: st.profileImage,
        sessionsTaught,
        creditsEarned,
        avgRating,
        reviewCount: rData ? rData.count : 0,
        score,
      };
    });

    // Sort descending by sessionsTaught, then score, then creditsEarned
    rankedStudents.sort((a, b) => {
      if (b.sessionsTaught !== a.sessionsTaught) {
        return b.sessionsTaught - a.sessionsTaught;
      }
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.creditsEarned - a.creditsEarned;
    });

    // Assign rank and badges
    const leaderboardWithRank = rankedStudents.map((st, idx) => {
      const rank = idx + 1;
      return {
        ...st,
        rank,
        badge: getBadgeForRank(rank, st.sessionsTaught),
      };
    });

    // 5. Identify Current User Ranking
    const userIndex = leaderboardWithRank.findIndex(
      (st) => st._id.toString() === currentUserId
    );

    const currentUserRankData =
      userIndex !== -1
        ? leaderboardWithRank[userIndex]
        : {
            rank: leaderboardWithRank.length + 1,
            sessionsTaught: 0,
            badge: getBadgeForRank(leaderboardWithRank.length + 1, 0),
          };

    // Calculate gap to next rank
    let sessionsToNextRank = 0;
    if (userIndex > 0) {
      const aheadStudent = leaderboardWithRank[userIndex - 1];
      sessionsToNextRank = Math.max(1, aheadStudent.sessionsTaught - currentUserRankData.sessionsTaught + 1);
    }

    // Top 10 slice
    const top10 = leaderboardWithRank.slice(0, 10);

    res.json({
      success: true,
      period,
      monthName,
      totalParticipants: students.length,
      top10,
      myRank: {
        ...currentUserRankData,
        sessionsToNextRank,
        totalParticipants: students.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
};
