import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  Sparkles,
  Star,
  Users,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const LeaderboardPage = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('monthly'); // 'monthly' | 'all'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await leaderboardService.getLeaderboard(period);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const top10 = data?.top10 || [];
  const myRank = data?.myRank || {};
  const monthName = data?.monthName || 'Current Month';

  // Extract top 3 for podium
  const rank1 = top10[0];
  const rank2 = top10[1];
  const rank3 = top10[2];

  return (
    <div className="space-y-6">
      {/* Page Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Peer Mentoring Leaderboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Celebrating top student teachers, active peer contributors, and verified skill mentors on SkillBridge.
          </p>
        </div>

        {/* Tab Switcher: Monthly vs All-Time */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setPeriod('monthly')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              period === 'monthly'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Monthly Rankings ({monthName})
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              period === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            All-Time Hall of Fame
          </button>
        </div>
      </div>

      {/* MY RANKING HIGHLIGHT CARD */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-indigo-200">Your Rank</span>
            <span className="text-2xl font-black text-amber-300">
              #{myRank.rank || '—'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {user?.name} (You)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center gap-1">
                {myRank.badge?.icon} {myRank.badge?.name}
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {user?.college || 'Student Mentor'} • {myRank.sessionsTaught ?? 0} teaching sessions completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-indigo-700/50 pt-4 md:pt-0">
          <div className="text-center md:text-right">
            <span className="text-[11px] text-indigo-200 block">Total Participants</span>
            <span className="text-sm font-extrabold text-white">
              {data?.totalParticipants || 0} Students
            </span>
          </div>

          <div className="text-center md:text-right">
            <span className="text-[11px] text-indigo-200 block">Status</span>
            <span className="text-xs font-bold text-emerald-300">
              {myRank.sessionsToNextRank > 0
                ? `${myRank.sessionsToNextRank} more session to advance!`
                : 'Top Contributor! 🎉'}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* PODIUM DISPLAY FOR TOP 3 */}
          {top10.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-2">
              {/* #2 Silver (Left) */}
              <div className="order-2 sm:order-1 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-extrabold text-sm flex items-center justify-center mb-2 border border-slate-300">
                  2
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-600 text-white font-bold text-xl flex items-center justify-center shadow-md mb-2">
                  {rank2.name?.charAt(0) || '2'}
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px] mb-2 flex items-center gap-1">
                  🥈 Silver Contributor
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-full">
                  {rank2.name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate max-w-full">
                  {rank2.college}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 w-full flex justify-around text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{rank2.sessionsTaught}</span>
                    <p className="text-[10px] text-slate-400">Taught</p>
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-600">⭐ {rank2.avgRating}</span>
                    <p className="text-[10px] text-slate-400">Rating</p>
                  </div>
                </div>
              </div>

              {/* #1 Gold (Center, Elevated) */}
              <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 rounded-3xl border-2 border-amber-300 p-6 shadow-md flex flex-col items-center text-center relative overflow-hidden sm:-translate-y-2">
                <div className="absolute top-2 right-2 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  👑 Leader
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center mb-2 shadow-xs">
                  1
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-200/50 mb-2">
                  {rank1.name?.charAt(0) || '1'}
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300 text-[11px] mb-2 flex items-center gap-1 shadow-2xs">
                  🥇 Gold Mentor
                </span>
                <h4 className="text-sm font-black text-slate-900 truncate max-w-full">
                  {rank1.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate max-w-full">
                  {rank1.college}
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200/60 w-full flex justify-around text-xs">
                  <div>
                    <span className="font-black text-slate-900 text-sm">{rank1.sessionsTaught}</span>
                    <p className="text-[10px] text-slate-500 font-semibold">Taught</p>
                  </div>
                  <div>
                    <span className="font-black text-amber-700 text-sm">⭐ {rank1.avgRating}</span>
                    <p className="text-[10px] text-slate-500 font-semibold">Rating</p>
                  </div>
                </div>
              </div>

              {/* #3 Bronze (Right) */}
              <div className="order-3 sm:order-3 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-900 font-extrabold text-sm flex items-center justify-center mb-2 border border-orange-200">
                  3
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-orange-800 text-white font-bold text-xl flex items-center justify-center shadow-md mb-2">
                  {rank3.name?.charAt(0) || '3'}
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 font-bold border border-orange-200 text-[11px] mb-2 flex items-center gap-1">
                  🥉 Bronze Swapper
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-full">
                  {rank3.name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate max-w-full">
                  {rank3.college}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 w-full flex justify-around text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{rank3.sessionsTaught}</span>
                    <p className="text-[10px] text-slate-400">Taught</p>
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-600">⭐ {rank3.avgRating}</span>
                    <p className="text-[10px] text-slate-400">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOP 10 RANKINGS TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top 10 Ranked Student Mentors ({period === 'monthly' ? monthName : 'All-Time'})
              </h3>
              <span className="text-xs text-slate-400">
                Ranked by verified teaching contributions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Student Mentor</th>
                    <th className="py-3 px-3">College & Dept</th>
                    <th className="py-3 px-3 text-center">Badge Tier</th>
                    <th className="py-3 px-3 text-center">Sessions Taught</th>
                    <th className="py-3 px-3 text-center">Rating</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {top10.map((st) => {
                    const isSelf = st._id.toString() === (user?._id || user?.id)?.toString();
                    return (
                      <tr
                        key={st._id}
                        className={`transition ${
                          isSelf ? 'bg-indigo-50/50 font-semibold' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-3 whitespace-nowrap font-black text-sm">
                          <span
                            className={`w-7 h-7 rounded-full inline-flex items-center justify-center ${
                              st.rank === 1
                                ? 'bg-amber-400 text-amber-950 font-black'
                                : st.rank === 2
                                ? 'bg-slate-200 text-slate-800'
                                : st.rank === 3
                                ? 'bg-orange-200 text-orange-900'
                                : 'text-slate-500'
                            }`}
                          >
                            {st.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                              {st.name?.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900">
                                {st.name} {isSelf && '(You)'}
                              </span>
                              <span className="text-[10px] text-slate-400 block">{st.year}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <p className="font-medium text-slate-800 truncate max-w-xs">{st.college}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{st.department}</p>
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.badge?.bgColor}`}
                          >
                            {st.badge?.icon} {st.badge?.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap font-black text-slate-800">
                          {st.sessionsTaught}
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap font-bold text-amber-600">
                          ⭐ {st.avgRating}
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <Link
                            to={`/users/${st._id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            Profile <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACHIEVEMENT BADGES SYSTEM SHOWCASE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              SkillBridge Achievement Badges System
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Badges are awarded automatically based on teaching contributions and completed peer sessions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200 flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-1">🥇</div>
                  <h4 className="text-xs font-black text-amber-950">Gold Mentor</h4>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Awarded to the Rank #1 highest contributing peer mentor of the ranking period.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 mt-3 block">Tier: Gold</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-1">🥈</div>
                  <h4 className="text-xs font-black text-slate-900">Silver Contributor</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Awarded to the Rank #2 top peer mentor of the ranking period.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-3 block">Tier: Silver</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/40 border border-orange-200 flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-1">🥉</div>
                  <h4 className="text-xs font-black text-orange-950">Bronze Swapper</h4>
                  <p className="text-[11px] text-orange-800 mt-1">
                    Awarded to the Rank #3 top peer mentor of the ranking period.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-orange-700 mt-3 block">Tier: Bronze</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/40 border border-indigo-100 flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-1">⭐</div>
                  <h4 className="text-xs font-black text-indigo-950">Community Star</h4>
                  <p className="text-[11px] text-indigo-800 mt-1">
                    Awarded to all student teachers holding a Top 10 position on the active leaderboard.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 mt-3 block">Tier: Community</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
