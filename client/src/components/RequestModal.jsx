import React, { useState } from 'react';
import { X, Calendar, Clock, Send, AlertCircle, Sparkles } from 'lucide-react';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const RequestModal = ({ isOpen, onClose, targetListing, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [learningObjective, setLearningObjective] = useState('');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('17:00');
  const [duration, setDuration] = useState('60 mins');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !targetListing) return null;

  const teacher = targetListing.userId;
  const skill = targetListing.skillId;
  const hasCredits = (user?.credits?.available ?? 0) >= 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!hasCredits) {
      setError('Insufficient credits. You need at least 1 credit to request a learning session.');
      return;
    }

    if (!learningObjective || !message || !preferredDate || !preferredTime) {
      setError('Please fill in all required request fields');
      return;
    }

    try {
      setLoading(true);
      const res = await requestService.createRequest({
        teacherId: teacher._id,
        skillId: skill._id,
        learningObjective,
        message,
        preferredDate,
        preferredTime,
        duration,
      });

      if (res.success) {
        if (refreshUser) refreshUser();
        if (onSuccess) onSuccess(res.request);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit learning request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Request Peer Mentoring
            </span>
            <h3 className="text-base font-bold text-slate-800">
              Learn {skill?.name} from {teacher?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {!hasCredits && (
            <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Zero Available Credits!</strong>
                <p className="mt-0.5">
                  You currently have 0 credits. You can earn credits by offering to teach fellow students skills you know!
                </p>
                <Link
                  to="/dashboard/skills"
                  onClick={onClose}
                  className="inline-block mt-1 font-bold underline text-amber-900"
                >
                  Add a teaching skill now →
                </Link>
              </div>
            </div>
          )}

          {/* Teacher Summary Pill */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-medium">Teacher College:</span>
              <p className="font-semibold text-slate-700">{teacher?.college || 'Student'}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-medium">Session Cost:</span>
              <p className="font-bold text-indigo-600">1 Credit (upon completion)</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              What is your specific learning objective? *
            </label>
            <input
              type="text"
              required
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              placeholder="e.g. Master loops, functions, and list comprehensions"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Introductory Message to {teacher?.name} *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I am working on a coursework project and would love your guidance on this topic..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Preferred Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Preferred Time *
              </label>
              <input
                type="time"
                required
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Session Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            >
              <option value="30 mins">30 Minutes</option>
              <option value="45 mins">45 Minutes</option>
              <option value="60 mins">60 Minutes (Standard)</option>
              <option value="90 mins">90 Minutes</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasCredits}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition duration-150"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
