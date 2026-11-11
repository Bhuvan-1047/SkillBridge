const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SkillListing = require('../models/SkillListing');
const Request = require('../models/Request');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { connectDB } = require('../config/db');

dotenv.config();

const initialSkills = [
  // Programming
  { name: 'Python', category: 'Programming', description: 'Core Python syntax, OOP, libraries, and scripting' },
  { name: 'Java', category: 'Programming', description: 'Core Java, collections framework, and OOP design' },
  { name: 'C++', category: 'Programming', description: 'Modern C++, STL algorithms, and memory management' },
  { name: 'JavaScript', category: 'Programming', description: 'ES6+, asynchronous programming, closures, and DOM' },

  // Web Development
  { name: 'Web Development', category: 'Web Development', description: 'Full-stack web application development, client-server architecture, and deployment' },
  { name: 'React.js', category: 'Web Development', description: 'Components, hooks, state management, and modern SPA architecture' },
  { name: 'Node.js', category: 'Web Development', description: 'Express.js REST APIs, middleware, and backend server development' },
  { name: 'HTML & CSS', category: 'Web Development', description: 'Semantic HTML5, CSS Flexbox, Grid, and responsive web design' },
  { name: 'Tailwind CSS', category: 'Web Development', description: 'Utility-first modern styling and custom responsive components' },

  // App Development
  { name: 'Flutter', category: 'App Development', description: 'Cross-platform mobile apps using Dart and Flutter widgets' },
  { name: 'React Native', category: 'App Development', description: 'Native mobile app development for Android and iOS using React' },

  // UI/UX Design
  { name: 'UI/UX Design', category: 'UI/UX Design', description: 'User interface design principles, design systems, and wireframing' },
  { name: 'Figma', category: 'UI/UX Design', description: 'Figma components, auto-layout, interactive prototypes, and design tokens' },

  // Database Management
  { name: 'MongoDB', category: 'Database Management', description: 'NoSQL document database, aggregation pipelines, and Mongoose ODM' },
  { name: 'MySQL', category: 'Database Management', description: 'Relational database schemas, joins, indexing, and SQL queries' },

  // Data Science
  { name: 'Data Science', category: 'Data Science', description: 'Data analysis, statistics, pandas, and data preprocessing' },
  { name: 'Machine Learning', category: 'Data Science', description: 'Scikit-learn algorithms, supervised and unsupervised modeling' },

  // Graphic Design
  { name: 'Graphic Design', category: 'Graphic Design', description: 'Visual hierarchy, typography, branding, and asset design' },
  { name: 'Canva', category: 'Graphic Design', description: 'Fast marketing graphics, presentations, and social media banners' },

  // Communication Skills
  { name: 'Communication Skills', category: 'Communication Skills', description: 'Professional email etiquette, team communication, and interpersonal skills' },
  { name: 'Public Speaking', category: 'Communication Skills', description: 'Confidence, presentation delivery, and viva defense' },

  // Video Editing
  { name: 'Video Editing', category: 'Video Editing', description: 'Video pacing, transitions, color grading, and audio syncing' },

  // Aptitude and Interview Preparation
  { name: 'Data Structures & Algorithms', category: 'Aptitude and Interview Preparation', description: 'Arrays, Trees, Graphs, Dynamic Programming, and technical interview prep' },
  { name: 'Quantitative Aptitude', category: 'Aptitude and Interview Preparation', description: 'Speed math, arithmetic, and placement aptitude problems' },
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    await SkillListing.deleteMany({});
    await Request.deleteMany({});
    await Session.deleteMany({});
    await Transaction.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    // 1. Insert Skills
    const createdSkills = await Skill.insertMany(initialSkills);

    const getSkill = (name) => createdSkills.find((s) => s.name.toLowerCase() === name.toLowerCase());

    // 2. Create Users
    // Arjun (Python teacher, wants UI/UX)
    const arjun = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun@college.edu',
      password: 'password123',
      college: 'Apex Institute of Technology',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      bio: 'Competitive programmer and Python enthusiast. Looking to improve my frontend design aesthetics!',
      credits: {
        available: 4, // 3 initial + 1 earned
        reserved: 0,
        earned: 1,
        spent: 0,
      },
    });

    // Priya (UI/UX teacher, wants Python) -> MUTUAL MATCH WITH ARJUN
    const priya = await User.create({
      name: 'Priya Patel',
      email: 'priya@college.edu',
      password: 'password123',
      college: 'Apex Institute of Technology',
      department: 'Information Technology',
      year: '3rd Year',
      bio: 'Figma lover, UI/UX designer. Eager to master Python for backend scripts and automation!',
      credits: {
        available: 2, // 3 initial - 1 spent
        reserved: 0,
        earned: 0,
        spent: 1,
      },
    });

    // Rohit (Data Science & MongoDB teacher, wants React)
    const rohit = await User.create({
      name: 'Rohit Verma',
      email: 'rohit@college.edu',
      password: 'password123',
      college: 'Metro Engineering College',
      department: 'Data Science & AI',
      year: '4th Year',
      bio: 'Hands-on with data analysis, pandas, and databases. Excited to learn modern React web apps.',
      credits: {
        available: 3,
        reserved: 0,
        earned: 0,
        spent: 0,
      },
    });

    // Sneha (Communication teacher, wants Web Dev)
    const sneha = await User.create({
      name: 'Sneha Kulkarni',
      email: 'sneha@college.edu',
      password: 'password123',
      college: 'Apex Institute of Technology',
      department: 'Electronics & Communication',
      year: '2nd Year',
      bio: 'Debate club lead and public speaking mentor. Interested in building interactive websites!',
      credits: {
        available: 3,
        reserved: 0,
        earned: 0,
        spent: 0,
      },
    });

    // Admin Account
    const admin = await User.create({
      name: 'Prof. Admin Controller',
      email: 'admin@skillbridge.edu',
      password: 'admin123',
      college: 'SkillBridge Central University',
      department: 'Computer Science Department',
      year: 'Postgraduate',
      role: 'admin',
      bio: 'Platform moderator and laboratory supervisor.',
      credits: {
        available: 10,
        reserved: 0,
        earned: 0,
        spent: 0,
      },
    });

    // 3. Create Initial Welcome Credit Transactions
    for (const u of [arjun, priya, rohit, sneha]) {
      await Transaction.create({
        userId: u._id,
        type: 'Initial credits',
        amount: 3,
        description: 'Welcome gift: 3 initial credits allocated upon student registration',
      });
    }

    // 4. Create Skill Listings (Teach & Learn)
    const skillListings = [
      // Arjun's skills
      {
        userId: arjun._id,
        skillId: getSkill('Python')._id,
        type: 'teach',
        proficiency: 'Advanced',
        experience: '2 years active coding, built multiple automation tools',
        description: 'Can guide you from beginner loops to OOP and practical scripts. Bring your questions!',
        availability: 'Weekdays after 6 PM, Saturday afternoons',
        sessionDuration: '60 mins',
        mode: 'online',
      },
      {
        userId: arjun._id,
        skillId: getSkill('Web Development')._id,
        type: 'teach',
        proficiency: 'Intermediate',
        experience: 'Full stack course completed, built 2 MERN projects',
        description: 'Happy to help with Express routes, REST APIs, and basic React frontend setup.',
        availability: 'Weekends',
        sessionDuration: '45 mins',
        mode: 'online',
      },
      {
        userId: arjun._id,
        skillId: getSkill('UI/UX Design')._id,
        type: 'learn',
        proficiency: 'Beginner',
        experience: 'Know basic design concepts, want practical Figma mentoring',
        description: 'Looking to learn modern component design, color palettes, and mobile mockups.',
        availability: 'Flexible evenings',
        sessionDuration: '60 mins',
        mode: 'online',
      },

      // Priya's skills (MUTUAL MATCH with Arjun!)
      {
        userId: priya._id,
        skillId: getSkill('UI/UX Design')._id,
        type: 'teach',
        proficiency: 'Expert',
        experience: 'Lead designer at GDSC club, 3 freelance client UI projects',
        description: 'I can teach Figma auto-layout, design tokens, responsive typography, and mobile wireframes.',
        availability: 'Mon, Wed, Fri 5-8 PM',
        sessionDuration: '60 mins',
        mode: 'online',
      },
      {
        userId: priya._id,
        skillId: getSkill('Figma')._id,
        type: 'teach',
        proficiency: 'Expert',
        experience: '2 years daily Figma power-user',
        description: 'Master shortcuts, components, variants, and interactive prototyping.',
        availability: 'Tuesdays and Thursdays',
        sessionDuration: '45 mins',
        mode: 'online',
      },
      {
        userId: priya._id,
        skillId: getSkill('Python')._id,
        type: 'learn',
        proficiency: 'Beginner',
        experience: 'Zero Python coding background',
        description: 'Want to understand basic syntax, loops, and write simple data processing scripts.',
        availability: 'Weekends & weekday evenings',
        sessionDuration: '60 mins',
        mode: 'online',
      },

      // Rohit's skills
      {
        userId: rohit._id,
        skillId: getSkill('Data Science')._id,
        type: 'teach',
        proficiency: 'Advanced',
        experience: 'Kaggle competitor, university data research fellow',
        description: 'Can teach data cleaning with pandas, matplotlib visualizations, and exploratory analysis.',
        availability: 'Sunday mornings',
        sessionDuration: '60 mins',
        mode: 'online',
      },
      {
        userId: rohit._id,
        skillId: getSkill('MongoDB')._id,
        type: 'teach',
        proficiency: 'Intermediate',
        experience: 'Used MongoDB in 4 production lab assignments',
        description: 'Document schema design, indexing, queries, and aggregation pipelines explained easily.',
        availability: 'Saturday afternoons',
        sessionDuration: '45 mins',
        mode: 'both',
      },
      {
        userId: rohit._id,
        skillId: getSkill('React.js')._id,
        type: 'learn',
        proficiency: 'Beginner',
        experience: 'Basic HTML/JS knowledge',
        description: 'Want to learn how React components, props, and hooks work.',
        availability: 'Weekdays after 7 PM',
        sessionDuration: '60 mins',
        mode: 'online',
      },

      // Sneha's skills
      {
        userId: sneha._id,
        skillId: getSkill('Public Speaking')._id,
        type: 'teach',
        proficiency: 'Expert',
        experience: 'National collegiate debate winner, TEDx student speaker',
        description: 'Overcome stage fright, master vocal modulation, and deliver standout project presentations!',
        availability: 'Weekdays 4-6 PM',
        sessionDuration: '45 mins',
        mode: 'both',
      },
      {
        userId: sneha._id,
        skillId: getSkill('Web Development')._id,
        type: 'learn',
        proficiency: 'Beginner',
        experience: 'Learning basics in curriculum',
        description: 'Want help creating portfolio website using HTML, CSS, and basic JavaScript.',
        availability: 'Weekends',
        sessionDuration: '60 mins',
        mode: 'online',
      },
    ];

    await SkillListing.insertMany(skillListings);

    // 5. Create a Completed Historical Session between Arjun (Teacher) and Priya (Learner)
    const pythonSkill = getSkill('Python');
    const pastRequest = await Request.create({
      learnerId: priya._id,
      teacherId: arjun._id,
      skillId: pythonSkill._id,
      message: 'Hi Arjun! I saw you teach Python. Could you help me with basic syntax and lists?',
      learningObjective: 'Master variables, loops, and list comprehensions in Python',
      preferredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      preferredTime: '06:00 PM',
      duration: '60 mins',
      status: 'completed',
    });

    const pastSession = await Session.create({
      requestId: pastRequest._id,
      learnerId: priya._id,
      teacherId: arjun._id,
      skillId: pythonSkill._id,
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: '60 mins',
      mode: 'online',
      meetingLink: 'https://meet.google.com/xyz-demo-session',
      status: 'Completed',
      learnerConfirmed: true,
      teacherConfirmed: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000),
    });

    // Credit transactions for the completed session
    await Transaction.create({
      userId: priya._id,
      sessionId: pastSession._id,
      type: 'Spent credits',
      amount: -1,
      description: `Spent 1 credit for completed learning session in Python with Arjun Sharma`,
      referenceId: pastSession._id.toString(),
    });

    await Transaction.create({
      userId: arjun._id,
      sessionId: pastSession._id,
      type: 'Earned credits',
      amount: 1,
      description: `Earned 1 credit for successfully teaching Python to Priya Patel`,
      referenceId: pastSession._id.toString(),
    });

    // Review from Priya for Arjun
    await Review.create({
      sessionId: pastSession._id,
      reviewerId: priya._id,
      revieweeId: arjun._id,
      rating: 5,
      teachingQuality: 5,
      communication: 5,
      comment: 'Arjun explained Python fundamentals with great practical examples. Highly recommended teacher!',
    });

    // 6. Create an Upcoming Scheduled Session between Priya (Teacher) and Arjun (Learner)
    const uiSkill = getSkill('UI/UX Design');
    const upcomingRequest = await Request.create({
      learnerId: arjun._id,
      teacherId: priya._id,
      skillId: uiSkill._id,
      message: 'Hi Priya! Could you guide me through Figma wireframing for my upcoming web project?',
      learningObjective: 'Learn basic wireframing and how to arrange UI elements cleanly',
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      preferredTime: '05:30 PM',
      duration: '60 mins',
      status: 'accepted',
    });

    await Session.create({
      requestId: upcomingRequest._id,
      learnerId: arjun._id,
      teacherId: priya._id,
      skillId: uiSkill._id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: '60 mins',
      mode: 'online',
      meetingLink: 'https://meet.google.com/abc-peer-design',
      status: 'Scheduled',
      learnerConfirmed: false,
      teacherConfirmed: false,
    });

    // Notification
    await Notification.create({
      userId: arjun._id,
      title: 'Upcoming Session in 2 Days 📅',
      message: 'Your UI/UX Design session with Priya Patel is scheduled for 5:30 PM.',
      type: 'session',
      link: '/dashboard/sessions',
    });

    return true;
  } catch (error) {
    console.error(' Seeding failed:', error);
    throw error;
  }
};

// Allow direct CLI execution: node utils/seedData.js
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log('✨ Database seeded! You can now log in.');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase };
