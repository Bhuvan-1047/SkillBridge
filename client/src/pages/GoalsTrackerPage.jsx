import React, { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';
import { skillService } from '../services/skillService';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Edit3,
  Award,
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GoalsTrackerPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Goal Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [targetWeeklySessions, setTargetWeeklySessions] = useState(2);
  const [targetWeeklyHours, setTargetWeeklyHours] = useState(2);
  const [notes, setNotes] = useState('');
  const [targetSkills, setTargetSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      const res = await goalService.getMyProgress();
      if (res.success) {
        setData(res);
        setTargetWeeklySessions(res.goal.targetWeeklySessions || 2);
        setTargetWeeklyHours(res.goal.targetWeeklyHours || 2);
        setNotes(res.goal.notes || '');
        setTargetSkills(res.goal.targetSkills || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load learning goal progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalData();
  }, []);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (targetSkills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      return;
    }
    setTargetSkills([...targetSkills, { name: newSkillName.trim(), completed: false }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index) => {
    setTargetSkills(targetSkills.filter((_, idx) => idx !== index));
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await goalService.updateGoal({
        targetWeeklySessions: Number(targetWeeklySessions),
        targetWeeklyHours: Number(targetWeeklyHours),
        targetSkills,
        notes,
      });
      if (res.success) {
        setIsEditing(false);
        setSuccessMsg('Learning goals updated successfully! Keep learning!');
        setTimeout(() => setSuccessMsg(''), 5000);
        await fetchGoalData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update goal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { goal, progress } = data || {};
  const sessionPct = progress?.sessionPercentage || 0;
  const hourPct = progress?.hourPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-600" />
            Learning Goals & Progress Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Set weekly targets, track completed sessions, and monitor skills learned on SkillBridge.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition duration-150 self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Weekly Goals
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Weekly Progress Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-700/50">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Current Week Status
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {progress?.statusLabel || 'In Progress'}
              </h2>
            </div>

            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-right">
              <span className="text-[11px] text-indigo-200 block font-medium">Weekly Target</span>
              <span className="text-lg font-extrabold text-white">
                {progress?.completedWeeklyCount ?? 0} / {goal?.targetWeeklySessions ?? 2} Sessions
              </span>
            </div>
          </div>

          {/* Visual Percentage Progress Bar (Sessions) */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Weekly Sessions Completion</span>
              <span className="text-indigo-200 font-mono">{sessionPct}%</span>
            </div>
            <div className="w-full h-3.5 bg-indigo-950/60 rounded-full overflow-hidden p-0.5 border border-indigo-700/40">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-300 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${sessionPct}%` }}
              ></div>
            </div>
          </div>

          {/* Hours Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Weekly Learning Time</span>
              <span className="text-indigo-200 font-mono">
                {progress?.hoursCompleted ?? 0} / {goal?.targetWeeklyHours ?? 2} Hours ({hourPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-indigo-950/60 rounded-full overflow-hidden p-0.5 border border-indigo-700/40">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-300 rounded-full transition-all duration-700"
                style={{ width: `${hourPct}%` }}
              ></div>
            </div>
          </div>

          {goal?.notes && (
            <p className="mt-6 text-xs text-indigo-100 italic bg-white/5 p-3 rounded-xl border border-white/10">
              "{goal.notes}"
            </p>
          )}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sessions This Week
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {progress?.completedWeeklyCount ?? 0}{' '}
              <span className="text-xs font-semibold text-slate-400">
                / {goal?.targetWeeklySessions ?? 2}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Study Hours Spent
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {progress?.hoursCompleted ?? 0}{' '}
              <span className="text-xs font-semibold text-slate-400">
                / {goal?.targetWeeklyHours ?? 2} hrs
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Skills Mastered
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {progress?.learnedSkillsCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Target Skills Checklist & Mastered Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Skills for this Goal */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Target Skills to Learn
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                + Add Skill
              </button>
            </div>

            {goal?.targetSkills?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No target skills selected yet. Click "Edit Weekly Goals" to choose skills!
              </p>
            ) : (
              <div className="space-y-2.5">
                {goal?.targetSkills?.map((skill, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      skill.completed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          skill.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {skill.completed ? <Check className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                      <span className="text-xs font-bold">{skill.name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        skill.completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {skill.completed ? 'Mastered ✓' : 'In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ready to learn new topics?</span>
            <Link
              to="/explore"
              className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Explore Mentors <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mastered Skills Showcase */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Skills Completed via Peer Sessions
              </h3>
            </div>

            {progress?.learnedSkills?.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  You haven't completed a learning session yet.
                </p>
                <Link
                  to="/explore"
                  className="inline-block mt-3 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
                >
                  Book Your First Session
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {progress.learnedSkills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-200/70 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {sk.name}
                    </span>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span>{sk.category}</span>
                      <span className="text-emerald-600 font-bold">Verified ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Skills are automatically verified when both you and your teacher confirm session completion.
          </div>
        </div>
      </div>

      {/* Sessions Completed This Week */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          Sessions Completed This Week
        </h3>

        {progress?.weeklySessions?.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No completed sessions recorded yet for this week. Book a session from "Explore Skills" to begin!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {progress.weeklySessions.map((s) => (
              <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{s.skillId?.name || 'Skill Session'}</span>
                  <p className="text-[11px] text-slate-500">
                    With {s.teacherId?.name} ({s.teacherId?.college}) • {s.duration || '60 mins'}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  Completed ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT GOALS MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Set Weekly Learning Goals</h3>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Weekly Target Sessions: <span className="text-indigo-600">{targetWeeklySessions} sessions</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={targetWeeklySessions}
                  onChange={(e) => setTargetWeeklySessions(e.target.value)}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 session</span>
                  <span>5 sessions</span>
                  <span>10 sessions</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Weekly Target Hours: <span className="text-indigo-600">{targetWeeklyHours} hours</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={targetWeeklyHours}
                  onChange={(e) => setTargetWeeklyHours(e.target.value)}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1 hr</span>
                  <span>10 hrs</span>
                  <span>20 hrs</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Skills You Want to Focus On
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Python, Figma, React"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {targetSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100"
                    >
                      {sk.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Personal Study Pledge / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Practice 45 mins every evening after classes!"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {saving ? 'Saving...' : 'Save Goals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
