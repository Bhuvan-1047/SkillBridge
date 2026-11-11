# SkillBridge – Student-to-Student Peer Skill Exchange Platform
**A Decentralized Peer-to-Peer Academic Knowledge Sharing & Credit Exchange System**

---

## 1. Project Overview & Problem Statement

Students possess diverse technical and creative skills but often lack an organized, collaborative platform to exchange knowledge with peers. Traditional online learning platforms are typically instructor-led, monetized, impersonal, and lack direct peer-to-peer engagement.

**SkillBridge** solves this by establishing a decentralized, student-driven knowledge exchange ecosystem where:
- Every student can act simultaneously as both a **Teacher** and a **Learner**.
- Students showcase skills they can teach and specify skills they wish to learn.
- A deterministic, rule-based matching engine discovers **complementary learning partners** (e.g., Student A teaches Python and wants UI/UX; Student B teaches UI/UX and wants Python).
- Learning requests and sessions are scheduled with agreed meeting links and dual completion confirmations.
- Knowledge exchange is governed by a fair, transparent **Credit Wallet System**:
  - Every new student receives **3 initial credits** upon registration.
  - Completing a teaching session **earns 1 credit**.
  - Completing a learning session **costs 1 credit**.
  - 1 credit is safely **reserved** upon request acceptance, and only transferred to the teacher when **both participants confirm session completion**.
- Experienced mentors can support peers through **Credit Donations** to empower students who have fewer teaching opportunities.
- Students stay motivated with **Weekly Learning Goals & Progress Tracking** and a competitive **Leaderboard with Achievement Badges**.

---

## 2. Key Features

### 🎯 1. Learning Goals & Progress Tracker
- **Weekly Target Setting**: Students customize weekly session targets (1–10 sessions) and study hours (1–20 hours).
- **Visual Progress Bars**: Animated percentage completion bars tracking weekly session counts and study time.
- **Mastered Skills Checklist**: Automatically logs and verifies skills once both participants confirm completion.
- **Weekly Status Badges**: Dynamic status indicators (`Goal Achieved! 🎉`, `On Track 🚀`, `In Progress`, `Not Started`).
- **Weekly Session Ledger**: Live breakdown of sessions attended during the current calendar week.

### 🎁 2. Credit Donation & Community Learning
- **Peer-to-Peer Donations**: Experienced teachers can donate available credits to fellow students.
- **Empowering Learners**: Helps students with fewer opportunities to teach acquire starter credits for vital mentoring sessions.
- **Searchable Recipient Directory**: Search registered students by name, college, or department with live balance previews.
- **Audit Ledger**: Every donation records immutable transactions (`Donation sent` and `Donation received`) with peer information.

### 🏆 3. Leaderboard & Achievement Badges
- **Top 10 Students**: Real-time ranking based on verified teaching contributions, completed sessions, and peer ratings.
- **Monthly Rankings Reset**: Toggle between **Monthly Rankings** (current calendar month) and **All-Time Hall of Fame** to encourage ongoing participation.
- **My Ranking Card**: Highlights the logged-in student's active rank position (e.g., `#2 of 14 Students`), current badge tier, and sessions needed to reach the next rank.
- **Top 3 Podium Display**: Visual 1st (Gold), 2nd (Silver), and 3rd (Bronze) podium showcase.
- **Achievement Badges System**:
  - 🥇 **Gold Mentor** (Rank #1 Top Contributor)
  - 🥈 **Silver Contributor** (Rank #2 Top Contributor)
  - 🥉 **Bronze Swapper** (Rank #3 Peer Swapper)
  - ⭐ **Community Star** (Top 10 Active Contributors)
  - 🌱 **Aspiring Teacher** (Starter Badge)

### 🧩 4. Complementary Student Matching Engine
- **Deterministic Rule-Based Matching**: Computes set intersections between student teaching profiles and learning interests.
- **Mutual Match Priority**: Automatically highlights students where both parties have complementary skills to exchange.
- **One-Way Learning**: Allows standard one-way requests when a student simply wants to learn from a mentor.

### 💼 5. Credit-Based Exchange System & Wallet
- **Double-Spending Prevention**: Credits are held in escrow (`reserved`) during scheduled sessions.
- **Dual Confirmation**: Both teacher and learner must confirm completion before credits transfer.
- **Instant Refund**: If a session is cancelled or rejected, the reserved credit is instantly refunded to the learner.
- **Audit Ledger**: Comprehensive audit trail tracking Initial, Earned, Spent, Reserved, Refunded, and Donated credits.

### 🧭 6. Modern Responsive UI & Persistent Navigation
- **Persistent Sidebar Navigation**: Clean desktop and tablet sidebar navigation across all dashboard pages and the skill directory.
- **Rich Landing Page Footer**: Complete with brand identity, Quick Links, Legal Disclaimers (Privacy, Terms, Guidelines modals), Support Contact, Social Media links, and Back-to-Top buttons.

---

## 3. Technology Stack

- **Frontend Framework**: React.js (v18.2) – Component-driven Single Page Application (SPA)
- **Build Tool & Bundler**: Vite (v5.2) – Lightning-fast HMR and optimized production bundling
- **Client Routing**: React Router DOM (v6.22) – Declarative routing with protected route guards
- **Styling**: Tailwind CSS (v3.4) – Utility-first responsive design
- **Iconography**: Lucide React – Modern vector iconography
- **HTTP Client**: Axios (v1.6) – Request/response interceptors with automatic JWT token attachment
- **Backend Runtime**: Node.js – Non-blocking asynchronous JavaScript runtime
- **Web Framework**: Express.js (v4.19) – RESTful API architecture with modular routers
- **Database**: MongoDB – NoSQL document database
- **ODM**: Mongoose (v8.3) – Schema validation, indexes, and relationship population
- **Zero-Config Database Fallback**: `mongodb-memory-server` – Embedded in-memory MongoDB fallback for instant demonstration out of the box
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing (10 salt rounds)

---

## 4. Project Folder Structure

```
skillbridge/
│
├── client/                          # React Frontend (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── Navbar.jsx           # Top navigation bar with credit badge & notifications
│   │   │   ├── Sidebar.jsx          # Persistent side navigation menu
│   │   │   ├── DashboardLayout.jsx  # Layout wrapper with sidebar and content area
│   │   │   ├── Footer.jsx           # Landing page footer with disclaimers & back-to-top
│   │   │   ├── SkillCard.jsx        # Modular skill card with tags & request trigger
│   │   │   ├── RequestModal.jsx     # Learning request submission modal
│   │   │   ├── ReviewModal.jsx      # Post-session peer feedback & 1-5 star ratings
│   │   │   ├── NotificationDropdown.jsx # Real-time alerts popover
│   │   │   └── ProtectedRoute.jsx   # Role-based route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Global auth state, user sync & credentials
│   │   │   └── NotificationContext.jsx # Real-time alerts & unread counter
│   │   ├── pages/                   # Application Views
│   │   │   ├── LandingPage.jsx      # Public landing page with hero & how-it-works
│   │   │   ├── LoginPage.jsx        # Student login + 1-Click Demo accounts
│   │   │   ├── RegisterPage.jsx     # Registration with 3 initial credits gift
│   │   │   ├── DashboardPage.jsx    # Student dashboard with analytics, goals & rank
│   │   │   ├── GoalsTrackerPage.jsx # Weekly goals, hours tracker & percentage bars
│   │   │   ├── LeaderboardPage.jsx  # Top 10 rankings, monthly toggle & badges
│   │   │   ├── MySkillsPage.jsx     # Manage teach/learn listings with CRUD
│   │   │   ├── ExploreSkillsPage.jsx # Multi-filtered skill directory with sidebar
│   │   │   ├── FindPartnersPage.jsx # Complementary & mutual skill matching
│   │   │   ├── StudentDetailsPage.jsx # Public student profile, stats & reviews
│   │   │   ├── RequestsPage.jsx     # Incoming & outgoing learning proposals
│   │   │   ├── SessionsPage.jsx     # Scheduled sessions & dual confirmation
│   │   │   ├── WalletPage.jsx       # Balances, credit donations & audit ledger
│   │   │   ├── ProfilePage.jsx      # Student bio & college profile editing
│   │   │   └── AdminDashboardPage.jsx # Student moderation & skill catalog
│   │   ├── services/                # Axios API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── goalService.js
│   │   │   ├── leaderboardService.js
│   │   │   ├── matchService.js
│   │   │   ├── notificationService.js
│   │   │   ├── requestService.js
│   │   │   ├── reviewService.js
│   │   │   ├── sessionService.js
│   │   │   ├── skillService.js
│   │   │   └── walletService.js
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Tailwind base directives
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js & Express REST Backend
│   ├── config/
│   │   └── db.js                    # Mongoose connection + In-Memory fallback
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile check, logout
│   │   ├── userController.js        # Student profiles, listings, session stats
│   │   ├── goalController.js        # Weekly goals & dynamic progress calculations
│   │   ├── leaderboardController.js # Top 10 rankings, badges & monthly scores
│   │   ├── skillController.js       # Skills catalog & skill listings CRUD
│   │   ├── matchController.js       # Complementary matching algorithm
│   │   ├── requestController.js     # Requests workflow & credit reservation
│   │   ├── sessionController.js     # Dual confirmation & atomic credit transfer
│   │   ├── walletController.js      # Balances, donations & transaction ledger
│   │   ├── reviewController.js      # Completed session ratings & feedback
│   │   └── notificationController.js # In-app notifications
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification & role authorization
│   │   └── error.js                 # Centralized 404 & error handlers
│   ├── models/                      # 9 Mongoose Schemas with Indexes
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── SkillListing.js
│   │   ├── Request.js
│   │   ├── Session.js
│   │   ├── Transaction.js
│   │   ├── Goal.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/                      # Modular Express Router Endpoints
│   ├── utils/
│   │   └── seedData.js              # Comprehensive demo dataset generator
│   ├── server.js                    # Express app initialization & server entry
│   ├── .env                         # Server environment variables
│   └── .env.example                 # Environment configuration template
│
├── run.js                           # Clean unified runner script
├── run.sh                           # Git Bash launcher
├── package.json                     # Root orchestrator package.json
└── README.md
```

---

## 5. Database Schema Design

| Collection | Key Fields & Constraints | Description |
|---|---|---|
| **Users** | `name`, `email` (unique), `password` (bcrypt), `college`, `department`, `year`, `bio`, `credits: { available, reserved, earned, spent }`, `role` | Stores student accounts, roles, and real-time wallet balances. |
| **Goals** | `userId` (unique), `targetWeeklySessions`, `targetWeeklyHours`, `targetSkills: [{ name, category, completed }]`, `notes` | Tracks individual weekly learning goals and skill mastery. |
| **Skills** | `name` (unique), `category` (predefined domains), `description`, `isActive` | Master catalog of technical and academic skills. |
| **SkillListings** | `userId`, `skillId`, `type` (`teach`/`learn`), `proficiency`, `experience`, `description`, `availability`, `sessionDuration`, `mode` | Individual student offerings. Enforces unique constraint per `(userId, skillId, type)`. |
| **Requests** | `learnerId`, `teacherId`, `skillId`, `message`, `learningObjective`, `preferredDate`, `preferredTime`, `duration`, `status` | Tracks learning proposals from students to mentors. |
| **Sessions** | `requestId`, `learnerId`, `teacherId`, `skillId`, `scheduledAt`, `duration`, `mode`, `meetingLink`, `status`, `learnerConfirmed`, `teacherConfirmed`, `completedAt` | Scheduled sessions with dual confirmation flags. |
| **Transactions** | `userId`, `sessionId`, `relatedUser`, `type` (`Initial`, `Reserved`, `Earned`, `Spent`, `Refunded`, `Donation sent`, `Donation received`), `amount`, `description` | Immutable financial ledger auditing every credit movement. |
| **Reviews** | `sessionId`, `reviewerId`, `revieweeId`, `rating` (1–5), `teachingQuality`, `communication`, `comment` | Post-session peer feedback. Unique compound index prevents duplicate reviews. |
| **Notifications** | `userId`, `title`, `message`, `type`, `isRead`, `link` | In-app alerts for proposals, session updates, donations, and credits. |

---

## 6. The Credit-Based Exchange Flow

```
[Student A (Learner)]                                [Student B (Teacher)]
         │                                                      │
         ├────── 1. Sends Learning Request ────────────────────>│
         │          (Verifies Student A has ≥ 1 credit)         │
         │                                                      │
         │<───── 2. Teacher Accepts Request ────────────────────┤
         │                                                      │
         ▼                                                      │
[Credit Engine: 1 Credit RESERVED]                              │
• Student A: available = available - 1, reserved = reserved + 1 │
• Transaction logged: "Reserved credits (-1)"                   │
• Status: "Scheduled"                                           │
         │                                                      │
         ├────── 3. Both Attend Session ───────────────────────┤
         │                                                      │
         ├────── 4. Student A Confirms Completion ─────────────>│
         │                                                      │
         │<───── 5. Student B Confirms Completion ──────────────┤
         │                                                      │
         ▼                                                      ▼
[Credit Engine: ATOMIC TRANSFER]                                │
• Student A: reserved = reserved - 1, spent = spent + 1         │
• Student B: available = available + 1, earned = earned + 1 <───┘
• Transaction logged for Learner: "Spent credits (-1)"
• Transaction logged for Teacher: "Earned credits (+1)"
• Session marked: "Completed"
• Rating & Review unlocked for both students
```

---

## 7. Pre-Seeded Demonstration Accounts

The database comes pre-seeded with test accounts representing real student scenarios:

| Student Name | Email Address | Password | Role / Primary Domain | Key Highlights |
|---|---|---|---|---|
| **Arjun Sharma** | `arjun@college.edu` | `password123` | CS Student / Python Teacher | Teaches Python & Web Dev; wants to learn UI/UX Design. |
| **Priya Patel** | `priya@college.edu` | `password123` | IT Student / UI/UX Teacher | Teaches UI/UX & Figma; wants Python. **(Mutual Match with Arjun!)** |
| **Rohit Verma** | `rohit@college.edu` | `password123` | Data Science Student | Teaches Data Science & MongoDB; wants React.js. |
| **Sneha Kulkarni** | `sneha@college.edu` | `password123` | Communication & Debate Lead | Teaches Public Speaking; wants Web Development. |
| **Admin Controller** | `admin@skillbridge.edu` | `admin123` | System Administrator | Can view all students, toggle account status, and manage skills. |

> **Pro Tip**: On the Login screen, click any of the **Quick Demo Login** buttons to authenticate instantly without typing credentials!

---

## 8. Installation & Execution Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **Git Bash** / Terminal

---

### Running the Application

Open a terminal in the root project folder and run:

```bash
npm run dev
# OR: bash run.sh
# OR: node run.js
```

*This automatically launches both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) in one unified terminal window!*

Open your browser at **`http://localhost:5173`**.

---

### Running Frontend and Backend Separately (Optional)

If you prefer separate terminal windows:
- **Terminal 1 (Backend)**:
  ```bash
  cd server
  npm start
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd client
  npm run dev
  ```

---

## 9. Backend API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register student; automatically gifts 3 initial credits.
- `POST /api/auth/login` – Authenticate with email and password; returns JWT token.
- `GET /api/auth/me` – Retrieve current authenticated student profile and live credit balances.
- `POST /api/auth/logout` – Clear student session.

### Users & Profiles (`/api/users`)
- `GET /api/users` – List all students with search and college filtering.
- `GET /api/users/:id` – Retrieve public profile, listings, completed stats, and reviews.
- `PUT /api/users/profile` – Update logged-in student's personal details and bio.
- `PUT /api/users/:id/status` – [Admin] Toggle account active/suspended status.

### Learning Goals (`/api/goals`)
- `GET /api/goals/my-progress` – Retrieve weekly target, completion percentage, study hours, and verified mastered skills.
- `PUT /api/goals` – Update weekly target sessions, hours, target skills checklist, and study notes.

### Leaderboard (`/api/leaderboard`)
- `GET /api/leaderboard?period=monthly` – Fetch top 10 ranked student mentors for current calendar month with badge tiers.
- `GET /api/leaderboard?period=all` – Fetch all-time top contributors.

### Skills & Listings (`/api/skills` & `/api/skill-listings`)
- `GET /api/skills` – List all predefined skill categories and skills.
- `POST /api/skills` – Add a new skill to the platform catalog.
- `GET /api/skill-listings` – Browse skills with multi-criteria filters (category, proficiency, college, mode, search).
- `POST /api/skill-listings` – Add a teaching skill or learning interest (prevents duplicate active listings).
- `PUT /api/skill-listings/:id` – Update an existing listing.
- `DELETE /api/skill-listings/:id` – Remove an existing listing.

### Complementary Student Matching (`/api/matches`)
- `GET /api/matches` – Deterministic matching engine identifying mutual skill matches and complementary learning partners.

### Learning Proposals (`/api/requests`)
- `POST /api/requests` – Send a session proposal (verifies `available >= 1` credit).
- `GET /api/requests/incoming` – Fetch proposals sent to the student as teacher.
- `GET /api/requests/outgoing` – Fetch proposals sent by the student as learner.
- `PUT /api/requests/:id/accept` – Teacher accepts proposal; reserves 1 credit from learner and schedules session.
- `PUT /api/requests/:id/reject` – Teacher declines proposal (no credits deducted).
- `PUT /api/requests/:id/cancel` – Learner cancels pending proposal.

### Sessions Management (`/api/sessions`)
- `GET /api/sessions` – List upcoming, completed, and cancelled sessions.
- `GET /api/sessions/:id` – Session details with meeting links and participants.
- `PUT /api/sessions/:id/reschedule` – Update meeting link (Google Meet URL) or date/time.
- `PUT /api/sessions/:id/complete` – Dual confirmation endpoint. When both students confirm, atomically transfers 1 credit to teacher.
- `PUT /api/sessions/:id/cancel` – Cancels session and refunds reserved credit back to learner.

### Credit Wallet & Donations (`/api/wallet`)
- `GET /api/wallet` – Available, reserved, earned, and spent credit metrics.
- `GET /api/wallet/history` – Complete transaction audit ledger.
- `GET /api/wallet/summary` – Summary statistics and recent activity.
- `POST /api/wallet/donate` – Transfer credits to a peer student with optional supportive message.

### Peer Reviews (`/api/reviews`)
- `POST /api/reviews` – Submit 1–5 star rating and feedback for completed sessions (enforces one review per participant per session).
- `GET /api/reviews/:userId` – Get reviews and average star rating for a student.

### Notifications (`/api/notifications`)
- `GET /api/notifications` – Real-time peer alerts with unread counter.
- `PUT /api/notifications/:id/read` – Mark individual notification as read.
- `PUT /api/notifications/read-all` – Mark all alerts as read.

---

## 10. Frequently Asked Architecture Questions

1. **Why is MongoDB suitable for SkillBridge over relational databases?**  
   Student profiles have dynamic, nested structures (flexible bios, multiple teaching skills, varying availability, and heterogeneous transaction descriptions). MongoDB's document model allows storing rich user credentials and credit sub-documents without complex relational joins.

2. **How does the credit reservation prevent double spending?**  
   When a teacher accepts a request, 1 credit is immediately deducted from the learner's `available` balance and transferred into `reserved`. The learner cannot spend this credit elsewhere. Only upon dual session confirmation is the credit moved to `spent` and awarded to the teacher.

3. **How does the complementary matching algorithm work without external AI APIs?**  
   The algorithm performs set intersection between User A's teaching skill IDs and User B's learning skill IDs, and vice-versa. If both intersections are non-empty, a **Mutual Skill Match** is identified and awarded top ranking score (+100 priority boost).

4. **How are credit donations audited?**  
   Credit donations generate two simultaneous ledger records in the `Transaction` collection: one negative amount for the donor (`Donation sent`) and one positive amount for the recipient (`Donation received`), cross-referenced with `relatedUser` for complete audit transparency.

5. **How is security handled across the application?**  
   Passwords are never stored in plaintext—they are hashed using bcrypt with salt rounds of 10. API endpoints are protected using JWT bearer tokens verified by Express middleware. Credit updates are strictly executed server-side to prevent client-side manipulation.

---

## 11. License

This project is licensed under the **ISC License**. Open source and free for educational exploration and peer collaboration.
