import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from '../components/ReviewModal';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  AlertCircle,
  User,
  ExternalLink,
  Edit2,
  X,
  Star,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export const SessionsPage = () => {
  const { user, refreshUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);

  // Reschedule / Meeting Link Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [meetingFormData, setMeetingFormData] = useState({
    scheduledAt: '',
    meetingLink: '',
    mode: 'online',
    duration: '60 mins',
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;

      const data = await sessionService.getSessions(params);
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [filterStatus]);

  const handleConfirmCompletion = async (sessionId) => {
    try {
      setActionLoadingId(sessionId);
      setError('');
      setSuccess('');
      const res = await sessionService.completeSession(sessionId);

      if (res.success) {
        if (res.isFullyCompleted) {
          setSuccess('🎉 Both participants confirmed! Session completed and 1 credit was transferred!');
        } else {
          setSuccess(res.message);
        }
        if (refreshUser) refreshUser();
        fetchSessions();
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm session');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelSession = async (sessionId) => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (reason === null) return;

    try {
      setActionLoadingId(sessionId);
      setError('');
      setSuccess('');
      const res = await sessionService.cancelSession(sessionId, reason);

      if (res.success) {
        setSuccess('Session cancelled. 1 reserved credit refunded back to learner.');
        if (refreshUser) refreshUser();
        fetchSessions();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel session');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReschedule = (session) => {
    setEditingSession(session);
    setMeetingFormData({
      scheduledAt: new Date(session.scheduledAt).toISOString().slice(0, 16),
      meetingLink: session.meetingLink || '',
      mode: session.mode || 'online',
      duration: session.duration || '60 mins',
    });
    setRescheduleModalOpen(true);
  };

  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    try {
      await sessionService.rescheduleSession(editingSession._id, meetingFormData);
      setSuccess('Session meeting details updated successfully!');
      setRescheduleModalOpen(false);
      fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to update session');
    }
  };

  const handleOpenReview = (session) => {
    setSelectedSessionForReview(session);
    setReviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Learning Sessions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled peer sessions, join video meets, and perform dual completion confirmation
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 text-xs">
          {['all', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition capitalize ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Credit Settlement Mechanism Explanation */}
      <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Dual Confirmation Credit Security:</strong>
          <p className="mt-0.5 text-slate-600">
            When a session concludes, both the teacher and the learner click "Confirm Completion".
            Once both sides confirm, 1 credit is transferred from the learner's reserved balance to the teacher's wallet!
          </p>
        </div>
      </div>

      {/* Session Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No sessions found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Accept pending learning requests or book new sessions with peers to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const currentUserId = (user?._id || user?.id)?.toString();
            const teacherIdStr = (session.teacherId?._id || session.teacherId)?.toString();
            const isTeacher = teacherIdStr === currentUserId;
            const partner = isTeacher ? session.learnerId : session.teacherId;
            const myConfirmed = isTeacher ? session.teacherConfirmed : session.learnerConfirmed;
            const partnerConfirmed = isTeacher ? session.learnerConfirmed : session.teacherConfirmed;

            const isCompleted = session.status === 'Completed';
            const isCancelled = session.status === 'Cancelled';
            const isScheduled = session.status === 'Scheduled' || session.status === 'Awaiting Confirmation';

            return (
              <div
                key={session._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Status & Skill Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}
                    >
                      {session.status}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isTeacher ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      You are the {isTeacher ? 'Teacher' : 'Learner'}
                    </span>

                    <h3 className="text-sm font-extrabold text-slate-900">
                      {session.skillId?.name}
                    </h3>
                  </div>

                  {/* Partner Info */}
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {isTeacher ? 'Teaching Student:' : 'Teacher:'}
                    </span>{' '}
                    <Link
                      to={`/users/${partner?._id}`}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      {partner?.name}
                    </Link>{' '}
                    • {partner?.college} ({partner?.department})
                  </p>

                  {/* Scheduled Details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {session.duration}
                    </span>

                    <span className="inline-flex items-center gap-1 capitalize font-medium">
                      <Video className="w-3.5 h-3.5 text-teal-600" />
                      {session.mode}
                    </span>
                  </div>

                  {/* Meeting Link Pill */}
                  {session.meetingLink ? (
                    <div className="inline-flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <Video className="w-4 h-4 text-indigo-600" />
                      <a
                        href={session.meetingLink.startsWith('http') ? session.meetingLink : `https://${session.meetingLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-xs"
                      >
                        Join Meeting Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      No meeting link added yet. Either participant can add one below.
                    </p>
                  )}

                  {/* Dual Confirmation Status Boxes */}
                  {isScheduled && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-semibold ${
                          myConfirmed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {myConfirmed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                        Your Confirmation: {myConfirmed ? 'Confirmed ✓' : 'Pending'}
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-semibold ${
                          partnerConfirmed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {partnerConfirmed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                        Partner Confirmation: {partnerConfirmed ? 'Confirmed ✓' : 'Awaiting...'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                  {isScheduled && (
                    <>
                      {!myConfirmed && (
                        <button
                          onClick={() => handleConfirmCompletion(session._id)}
                          disabled={actionLoadingId === session._id}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {partnerConfirmed ? 'Confirm & Finalize Credit Transfer' : 'Confirm Completion'}
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenReschedule(session)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Meeting Details / Reschedule
                      </button>

                      <button
                        onClick={() => handleCancelSession(session._id)}
                        disabled={actionLoadingId === session._id}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
                      >
                        Cancel Session
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => handleOpenReview(session)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      Leave Rating & Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedSessionForReview && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSessionForReview(null);
          }}
          session={selectedSessionForReview}
          onSuccess={() => {
            setSuccess('Thank you! Your peer rating has been recorded.');
            fetchSessions();
          }}
        />
      )}

      {/* Reschedule / Meeting Link Modal */}
      {rescheduleModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Update Meeting Details / Reschedule
              </h3>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={meetingFormData.scheduledAt}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, scheduledAt: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meeting Link (Google Meet, Zoom, MS Teams URL)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc-def"
                  value={meetingFormData.meetingLink}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, meetingLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={meetingFormData.duration}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, duration: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mode
                  </label>
                  <select
                    value={meetingFormData.mode}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, mode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Meeting Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
