const User = require('../models/User');
const SkillListing = require('../models/SkillListing');

// @desc    Get complementary skill matches for the logged in student
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // 1. Fetch current student's active teaching skills & learning interests
    const myTeachListings = await SkillListing.find({
      userId: currentUserId,
      type: 'teach',
      isActive: true,
    }).populate('skillId', 'name category');

    const myLearnListings = await SkillListing.find({
      userId: currentUserId,
      type: 'learn',
      isActive: true,
    }).populate('skillId', 'name category');

    const myTeachSkillIds = myTeachListings
      .filter((l) => l.skillId)
      .map((l) => l.skillId._id.toString());
    const myLearnSkillIds = myLearnListings
      .filter((l) => l.skillId)
      .map((l) => l.skillId._id.toString());

    if (myTeachSkillIds.length === 0 && myLearnSkillIds.length === 0) {
      return res.json({
        success: true,
        message: 'Add skills you can teach and want to learn to discover matched learning partners!',
        matches: [],
        mutualCount: 0,
      });
    }

    // 2. Fetch all other active students' active listings
    const otherListings = await SkillListing.find({
      userId: { $ne: currentUserId },
      isActive: true,
    })
      .populate('userId', 'name college department year bio profileImage')
      .populate('skillId', 'name category');

    // 3. Group listings by student
    const studentMap = {};

    for (const listing of otherListings) {
      if (!listing.userId || !listing.skillId || !listing.userId._id) continue;
      const otherId = listing.userId._id.toString();

      if (!studentMap[otherId]) {
        studentMap[otherId] = {
          student: listing.userId,
          teachListings: [],
          learnListings: [],
        };
      }

      if (listing.type === 'teach') {
        studentMap[otherId].teachListings.push(listing);
      } else {
        studentMap[otherId].learnListings.push(listing);
      }
    }

    // 4. Run rule-based complementary matching algorithm
    const matches = [];

    for (const otherId in studentMap) {
      const { student, teachListings, learnListings } = studentMap[otherId];

      // A: Skills I can teach that this student wants to learn
      const theyWantFromMe = [];
      for (const learnItem of learnListings) {
        if (myTeachSkillIds.includes(learnItem.skillId._id.toString())) {
          theyWantFromMe.push({
            skill: learnItem.skillId,
            listingId: learnItem._id,
            proficiency: learnItem.proficiency,
          });
        }
      }

      // B: Skills this student can teach that I want to learn
      const iWantFromThem = [];
      for (const teachItem of teachListings) {
        if (myLearnSkillIds.includes(teachItem.skillId._id.toString())) {
          iWantFromThem.push({
            skill: teachItem.skillId,
            listingId: teachItem._id,
            proficiency: teachItem.proficiency,
            experience: teachItem.experience,
          });
        }
      }

      const isMutual = theyWantFromMe.length > 0 && iWantFromThem.length > 0;
      const isComplementary = theyWantFromMe.length > 0 || iWantFromThem.length > 0;

      if (isComplementary) {
        // Calculate match score: mutual matches get priority boost
        let score = 0;
        if (isMutual) score += 100;
        score += theyWantFromMe.length * 20;
        score += iWantFromThem.length * 20;

        matches.push({
          student,
          matchType: isMutual ? 'Mutual Match' : (iWantFromThem.length > 0 ? 'Can Teach You' : 'Wants to Learn From You'),
          isMutual,
          score,
          theyWantFromMe, // What current user can teach them
          iWantFromThem,  // What current user can learn from them
          totalTeachSkills: teachListings.length,
          totalLearnSkills: learnListings.length,
        });
      }
    }

    // Sort matches: mutual matches first, then by score descending
    matches.sort((a, b) => b.score - a.score);

    const mutualCount = matches.filter((m) => m.isMutual).length;

    res.json({
      success: true,
      count: matches.length,
      mutualCount,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatches };
