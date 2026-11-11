const Skill = require('../models/Skill');
const SkillListing = require('../models/SkillListing');
const { SKILL_CATEGORIES } = require('../models/Skill');

// @desc    Get all predefined skills and categories
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skills = await Skill.find(query).sort({ name: 1 });

    res.json({
      success: true,
      categories: SKILL_CATEGORIES,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new skill (or register a custom skill name into catalog)
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both skill name and valid category',
      });
    }

    if (!SKILL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${SKILL_CATEGORIES.join(', ')}`,
      });
    }

    let skill = await Skill.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists in the catalog',
        skill,
      });
    }

    skill = await Skill.create({
      name: name.trim(),
      category,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Skill registered in catalog successfully',
      skill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill listings with multi-filter & search (Explore Skills)
// @route   GET /api/skill-listings
// @access  Public / Authenticated
const getSkillListings = async (req, res, next) => {
  try {
    const {
      type, // 'teach' or 'learn'
      category,
      search,
      proficiency,
      college,
      mode,
      userId,
      excludeUser,
    } = req.query;

    const query = { isActive: true };

    if (type) query.type = type;

    // Filter by specific user (e.g. My Skills)
    if (userId) {
      query.userId = userId;
    } else if (excludeUser && req.user) {
      // Exclude logged in user from explore/browse recommendations
      query.userId = { $ne: req.user._id };
    }

    if (proficiency) query.proficiency = proficiency;
    if (mode && mode !== 'all') query.mode = mode;

    let listings = await SkillListing.find(query)
      .populate('userId', 'name college department year bio profileImage')
      .populate('skillId', 'name category description')
      .sort({ createdAt: -1 });

    // Filter in-memory or chained for populated fields (category, search, college)
    if (category) {
      listings = listings.filter(
        (item) => item.skillId && item.skillId.category === category
      );
    }

    if (college) {
      listings = listings.filter(
        (item) =>
          item.userId &&
          item.userId.college.toLowerCase().includes(college.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      listings = listings.filter(
        (item) =>
          (item.skillId && item.skillId.name.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.userId && item.userId.name.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a skill listing (Teach or Learn)
// @route   POST /api/skill-listings
// @access  Private
const createSkillListing = async (req, res, next) => {
  try {
    const {
      skillId,
      skillName,
      category,
      type,
      proficiency,
      experience,
      description,
      availability,
      sessionDuration,
      mode,
    } = req.body;

    if (!type || !['teach', 'learn'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Listing type must be either 'teach' or 'learn'",
      });
    }

    let targetSkillId = skillId;

    // If new skill name passed, either find existing or create new skill in catalog
    if (!targetSkillId && skillName) {
      let existingSkill = await Skill.findOne({
        name: { $regex: new RegExp(`^${skillName.trim()}$`, 'i') },
      });

      if (!existingSkill) {
        existingSkill = await Skill.create({
          name: skillName.trim(),
          category: category || 'Programming',
          description: `Skill created for ${type}ing`,
        });
      }
      targetSkillId = existingSkill._id;
    }

    if (!targetSkillId) {
      return res.status(400).json({
        success: false,
        message: 'Please select or provide a skill',
      });
    }

    // Check for duplicate active listing of the same type for this user & skill
    const duplicate = await SkillListing.findOne({
      userId: req.user._id,
      skillId: targetSkillId,
      type,
      isActive: true,
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `You already have an active ${type === 'teach' ? 'teaching' : 'learning'} listing for this skill`,
      });
    }

    const listing = await SkillListing.create({
      userId: req.user._id,
      skillId: targetSkillId,
      type,
      proficiency: proficiency || 'Intermediate',
      experience: experience || '',
      description: description || `Looking forward to ${type}ing this skill.`,
      availability: availability || 'Flexible / As agreed',
      sessionDuration: sessionDuration || '45-60 mins',
      mode: mode || 'online',
    });

    const populatedListing = await SkillListing.findById(listing._id)
      .populate('userId', 'name college department year')
      .populate('skillId', 'name category description');

    res.status(201).json({
      success: true,
      message: `Skill ${type === 'teach' ? 'teaching' : 'learning'} listing created successfully`,
      listing: populatedListing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a skill listing
// @route   PUT /api/skill-listings/:id
// @access  Private
const updateSkillListing = async (req, res, next) => {
  try {
    const listing = await SkillListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found',
      });
    }

    // Ensure only the listing owner can update it
    if (listing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing',
      });
    }

    const {
      proficiency,
      experience,
      description,
      availability,
      sessionDuration,
      mode,
      isActive,
    } = req.body;

    if (proficiency) listing.proficiency = proficiency;
    if (experience !== undefined) listing.experience = experience;
    if (description) listing.description = description;
    if (availability !== undefined) listing.availability = availability;
    if (sessionDuration !== undefined) listing.sessionDuration = sessionDuration;
    if (mode) listing.mode = mode;
    if (isActive !== undefined) listing.isActive = isActive;

    await listing.save();

    const updatedListing = await SkillListing.findById(listing._id)
      .populate('userId', 'name college department year')
      .populate('skillId', 'name category description');

    res.json({
      success: true,
      message: 'Skill listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill listing
// @route   DELETE /api/skill-listings/:id
// @access  Private
const deleteSkillListing = async (req, res, next) => {
  try {
    const listing = await SkillListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found',
      });
    }

    // Ownership check (or admin)
    if (
      listing.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing',
      });
    }

    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Skill listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  createSkill,
  getSkillListings,
  createSkillListing,
  updateSkillListing,
  deleteSkillListing,
};
