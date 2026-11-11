import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skillService } from '../services/skillService';
import { requestService } from '../services/requestService';
import { sessionService } from '../services/sessionService';
import { walletService } from '../services/walletService';
import { matchService } from '../services/matchService';
import { goalService } from '../services/goalService';
import { leaderboardService } from '../services/leaderboardService';
import {
  Coins,
  BookOpen,
  Calendar,
  Users,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  Trophy,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [stats, setStats] = useState({
    teachingCount: 0,
    learningCount: 0,
    incomingRequests: 0,
    outgoingRequests: 0,
    upcomingSessions: [],
    recentTransactions: [],
    suggestedMatches: [],
  });
  const [goalData, setGoalData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setLoadErrors([]);
        if (refreshUser) refreshUser();

        const results = await Promise.allSettled([
          skillService.getSkillListings({ userId: currentUserId, type: 'teach' }),
          skillService.getSkillListings({ userId: currentUserId, type: 'learn' }),
          requestService.getIncoming(),
          requestService.getOutgoing(),
          sessionService.getSessions({ status: 'Scheduled' }),
          walletService.getHistory({ limit: 4 }),
          matchService.getMatches(),
          goalService.getMyProgress(),
          leaderboardService.getLeaderboard('monthly'),
        ]);

        if (!isMounted) return;

        const labels = [
          'teaching skills',
          'learning interests',
          'incoming requests',
          'outgoing requests',
          'upcoming sessions',
          'recent transactions',
          'suggested partners',
          'learning goals',
          'leaderboard',
        ];
        const data = results.map((result, index) => {
          if (result.status === 'fulfilled') return result.value;
          console.error(`Failed to load dashboard ${labels[index]}:`, result.reason);
          return {};
        });
        setLoadErrors(results.flatMap((result, index) =>
          result.status === 'rejected' ? [labels[index]] : []
        ));

        const [myTeach, myLearn, incoming, outgoing, sessionData, txData, matchData, gData, lData] = data;
        const pendingIncoming = (incoming.requests || []).filter((r) => r.status === 'pending');
        const pendingOutgoing = (outgoing.requests || []).filter((r) => r.status === 'pending');
        const upcomingSessions = (sessionData.sessions || []).slice(0, 3);

        if (gData?.success) setGoalData(gData);
        if (lData?.success) setLeaderboardData(lData);

        setStats({
          teachingCount: myTeach.listings?.length || 0,
          learningCount: myLearn.listings?.length || 0,
          incomingRequests: pendingIncoming.length,
          outgoingRequests: pendingOutgoing.length,
          upcomingSessions,
          recentTransactions: txData.transactions || [],
          suggestedMatches: (matchData.matches || []).slice(0, 2),
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (currentUserId) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
            Student Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed">
            {user?.department} • {user?.year} • {user?.college}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/skills"
              className="px-4 py-2 text-xs font-bold text-indigo-900 bg-white hover:bg-slate-50 rounded-xl shadow-xs transition"
            >
              + Add Skills to Teach
            </Link>
            <Link
              to="/explore"
              className="px-4 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl transition"
            >
              Browse Skills to Learn
            </Link>
          </div>
        </div>

        {/* Decorative corner orb */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
      </div>

      {/* 2. Action Required Alert (if pending incoming requests) */}
      {loadErrors.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <p className="text-xs text-amber-900">
            Some dashboard information couldn’t be loaded: {loadErrors.join(', ')}. Please try
            refreshing the page.
          </p>
        </div>
      )}

      {stats.incomingRequests > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                You have {stats.incomingRequests} pending learning request{stats.incomingRequests > 1 ? 's' : ''}!
              </h4>
              <p className="text-[11px] text-amber-700">
                Fellow students want to learn from you. Accept to schedule sessions and earn credits.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/requests"
            className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-xl shrink-0 transition"
          >
            Review Requests →
          </Link>
        </div>
      )}

      {/* Weekly Goal & Leaderboard Standing Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goal Progress Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Weekly Learning Goal</span>
            </div>
            <Link
              to="/dashboard/goals"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Tracker <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="my-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">Weekly Sessions Target</span>
              <span className="font-bold text-slate-900">
                {goalData?.progress?.completedWeeklyCount ?? 0} / {goalData?.goal?.targetWeeklySessions ?? 2} (
                {goalData?.progress?.sessionPercentage ?? 0}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${goalData?.progress?.sessionPercentage ?? 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              Status: <strong className="text-indigo-700">{goalData?.progress?.statusLabel || 'In Progress'}</strong>
            </span>
            <span>{goalData?.progress?.hoursCompleted ?? 0} hrs studied</span>
          </div>
        </div>

        {/* Leaderboard Standing Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Leaderboard Standing</span>
            </div>
            <Link
              to="/dashboard/leaderboard"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              Top 10 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <span className="text-2xl font-black text-slate-900">
                #{leaderboardData?.myRank?.rank || '—'}
              </span>
              <span className="text-xs text-slate-400 ml-1">Rank</span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
              {leaderboardData?.myRank?.badge?.icon || '🌱'}{' '}
              {leaderboardData?.myRank?.badge?.name || 'Active Peer'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>{leaderboardData?.myRank?.sessionsTaught ?? 0} sessions taught</span>
            <span className="text-emerald-700 font-semibold">
              {leaderboardData?.myRank?.sessionsToNextRank > 0
                ? `${leaderboardData?.myRank?.sessionsToNextRank} session to next rank`
                : 'Top Tier! 🎉'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit Balance Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Available Credits</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {user?.credits?.available ?? 0}
            </span>
            <span className="text-xs text-slate-400 ml-1">Credits</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Reserved: {user?.credits?.reserved ?? 0}</span>
            <Link to="/dashboard/wallet" className="text-indigo-600 font-bold hover:underline">
              Wallet →
            </Link>
          </div>
        </div>

        {/* Teaching Skills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Teaching Skills</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.teachingCount}
            </span>
            <span className="text-xs text-slate-400 ml-1">Active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <Link to="/dashboard/skills" className="text-indigo-600 font-bold hover:underline">
              Manage teaching skills →
            </Link>
          </div>
        </div>

        {/* Learning Interests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Learning Interests</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.learningCount}
            </span>
            <span className="text-xs text-slate-400 ml-1">Skills</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <Link to="/dashboard/skills" className="text-indigo-600 font-bold hover:underline">
              View learning list →
            </Link>
          </div>
        </div>

        {/* Learning Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Requests</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.incomingRequests + stats.outgoingRequests}
            </span>
            <span className="text-xs text-slate-400 ml-1">Pending</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>In: {stats.incomingRequests} | Out: {stats.outgoingRequests}</span>
            <Link to="/dashboard/requests" className="text-indigo-600 font-bold hover:underline">
              Requests →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Suggested Partners & Upcoming Sessions Two-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suggested Partners Preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Complementary Learning Partners
                </h3>
              </div>
              <Link
                to="/dashboard/partners"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View all matches →
              </Link>
            </div>

            {stats.suggestedMatches.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-60" />
                <p className="text-xs">No mutual partners found yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Add more teaching skills and learning interests to boost matches!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.suggestedMatches.map((m) => {
                  const studentId = m.student?._id || m.student?.id;
                  if (!studentId) return null;
                  return (
                    <div
                      key={studentId}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {m.student.name ? m.student.name.charAt(0) : 'P'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-800 truncate">
                              {m.student.name || 'Student Partner'}
                            </h4>
                            {m.isMutual && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                Mutual Match 🔄
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{m.student.college || 'College'}</p>
                        </div>
                      </div>
                      <Link
                        to={`/users/${studentId}`}
                        className="px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-white rounded-lg border border-slate-200 shrink-0 transition"
                      >
                        Connect
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Upcoming Scheduled Sessions
                </h3>
              </div>
              <Link
                to="/dashboard/sessions"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View all sessions →
              </Link>
            </div>

            {stats.upcomingSessions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-60" />
                <p className="text-xs">No upcoming sessions scheduled</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Accept a learning request or book a session with a peer!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingSessions.map((s) => {
                  const teacherIdStr = (s.teacherId?._id || s.teacherId)?.toString();
                  const isTeacher = teacherIdStr === currentUserId?.toString();
                  const partner = isTeacher ? s.learnerId : s.teacherId;

                  return (
                    <div
                      key={s._id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {s.skillId?.name || 'Skill Session'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isTeacher
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {isTeacher ? 'Teaching' : 'Learning'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          With {partner?.name || 'Partner'} •{' '}
                          {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'Date not set'}
                        </p>
                      </div>
                      <Link
                        to="/dashboard/sessions"
                        className="px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-white rounded-lg border border-slate-200 shrink-0 transition"
                      >
                        Details
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Credit Transactions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Recent Credit Activity
            </h3>
          </div>
          <Link
            to="/dashboard/wallet"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Full transaction ledger →
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentTransactions.map((tx) => (
              <div key={tx._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{tx.description}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <span
                  className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                    tx.amount > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credit
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
