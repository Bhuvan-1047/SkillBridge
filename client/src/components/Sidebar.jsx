import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Users,
  BookOpen,
  Send,
  Calendar,
  Wallet,
  User,
  Shield,
  LogOut,
  Sparkles,
  LogIn,
  UserPlus,
  Target,
  Trophy,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/explore', label: 'Explore Skills', icon: Compass },
    { to: '/dashboard/partners', label: 'Find Partners', icon: Users },
    { to: '/dashboard/goals', label: 'Learning Goals', icon: Target },
    { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/dashboard/skills', label: 'My Skills', icon: BookOpen },
    { to: '/dashboard/requests', label: 'Learning Requests', icon: Send },
    { to: '/dashboard/sessions', label: 'My Sessions', icon: Calendar },
    { to: '/dashboard/wallet', label: 'Credit Wallet', icon: Wallet },
    { to: '/dashboard/profile', label: 'My Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Student Mini Profile Card or Guest Badge */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user?.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">{user?.college || 'Student'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  🪙 {user?.credits?.available ?? 0} Credits
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800">Explore Skills</h4>
              <p className="text-[11px] text-slate-500">Student Directory</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  ● Live Mentors
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Student Platform
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Quick Tip & User Actions */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/70">
          <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Earn Tip
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Teach 1 session to earn 1 credit. Spend credits to book learning sessions!
          </p>
        </div>

        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <div className="space-y-1.5 pt-1">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </Link>
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up (3 Credits)</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
