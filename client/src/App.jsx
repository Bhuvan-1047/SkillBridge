import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ExploreSkillsPage } from './pages/ExploreSkillsPage';
import { StudentDetailsPage } from './pages/StudentDetailsPage';

// Student Dashboard Pages
import { DashboardPage } from './pages/DashboardPage';
import { MySkillsPage } from './pages/MySkillsPage';
import { FindPartnersPage } from './pages/FindPartnersPage';
import { RequestsPage } from './pages/RequestsPage';
import { SessionsPage } from './pages/SessionsPage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';
import { GoalsTrackerPage } from './pages/GoalsTrackerPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Standalone Public Pages without Sidebar */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Explore & Public Student Pages with Side Navigation Menu */}
                <Route element={<DashboardLayout />}>
                  <Route path="/explore" element={<ExploreSkillsPage />} />
                  <Route path="/users/:id" element={<StudentDetailsPage />} />
                </Route>

                {/* Protected Student Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="explore" element={<Navigate to="/explore" replace />} />
                  <Route path="skills" element={<MySkillsPage />} />
                  <Route path="partners" element={<FindPartnersPage />} />
                  <Route path="goals" element={<GoalsTrackerPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="requests" element={<RequestsPage />} />
                  <Route path="sessions" element={<SessionsPage />} />
                  <Route path="wallet" element={<WalletPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
