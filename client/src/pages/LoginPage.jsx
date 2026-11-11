import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-100 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Log in to manage your skills, sessions, and credit wallet
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-100 transition duration-150 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to SkillBridge'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Quick-Fill for FSD-2 Lab Evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick Demo Login (Pre-seeded Accounts)
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('arjun@college.edu', 'password123')}
              className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-xl transition flex flex-col"
            >
              <span className="font-bold">Arjun Sharma</span>
              <span className="text-[10px] text-slate-400">Teaches Python</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('priya@college.edu', 'password123')}
              className="p-2 text-left bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl transition flex flex-col"
            >
              <span className="font-bold">Priya Patel</span>
              <span className="text-[10px] text-slate-400">Teaches UI/UX</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('rohit@college.edu', 'password123')}
              className="p-2 text-left bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-xl transition flex flex-col"
            >
              <span className="font-bold">Rohit Verma</span>
              <span className="text-[10px] text-slate-400">Data Science</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@skillbridge.edu', 'admin123')}
              className="p-2 text-left bg-slate-50 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 rounded-xl transition flex flex-col"
            >
              <span className="font-bold">Admin Controller</span>
              <span className="text-[10px] text-slate-400">Platform Admin</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          New to SkillBridge?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register and get 3 credits
          </Link>
        </p>
      </div>
    </div>
  );
};
