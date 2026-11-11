import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Inbox,
  Check,
  X,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Coins,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const RequestsPage = () => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [inRes, outRes] = await Promise.all([
        requestService.getIncoming(),
        requestService.getOutgoing(),
      ]);

      setIncoming(inRes.requests || []);
      setOutgoing(outRes.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch learning requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      setError('');
      setActionSuccess('');
      const res = await requestService.acceptRequest(id);

      if (res.success) {
        setActionSuccess('Request accepted! 1 credit safely reserved and session scheduled.');
        if (refreshUser) refreshUser();
        fetchRequests();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    try {
      setProcessingId(id);
      setError('');
      const res = await requestService.rejectRequest(id);

      if (res.success) {
        setActionSuccess('Request declined. No credits were deducted.');
        fetchRequests();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending request?')) return;
    try {
      setProcessingId(id);
      setError('');
      const res = await requestService.cancelRequest(id);

      if (res.success) {
        setActionSuccess('Request cancelled successfully.');
        fetchRequests();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    } finally {
      setProcessingId(null);
    }
  };

  const currentRequests = activeTab === 'incoming' ? incoming : outgoing;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'completed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Learning Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage incoming requests from students who want to learn from you, and track your sent requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('incoming');
            setError('');
            setActionSuccess('');
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'incoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Requests ({incoming.filter((r) => r.status === 'pending').length} Pending)
        </button>

        <button
          onClick={() => {
            setActiveTab('outgoing');
            setError('');
            setActionSuccess('');
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'outgoing'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Outgoing Requests ({outgoing.length})
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : currentRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          {activeTab === 'incoming' ? (
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          ) : (
            <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          )}
          <h3 className="text-sm font-bold text-slate-800">
            No {activeTab} requests found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'incoming'
              ? 'When other students request your teaching skills, they will appear here for your review.'
              : 'Browse skills in the explore catalog or find matched partners to send learning requests!'}
          </p>
          {activeTab === 'outgoing' && (
            <Link
              to="/explore"
              className="inline-block mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-xs hover:bg-indigo-700"
            >
              Explore Skills Now
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentRequests.map((req) => {
            const isIncoming = activeTab === 'incoming';
            const partner = isIncoming ? req.learnerId : req.teacherId;

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {req.skillId?.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      ({req.skillId?.category})
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold">
                    {isIncoming ? 'Learner:' : 'Teacher:'}{' '}
                    <Link
                      to={`/users/${partner?._id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {partner?.name}
                    </Link>{' '}
                    <span className="text-slate-400 font-normal">
                      • {partner?.college} ({partner?.department})
                    </span>
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-700">
                      <strong>Objective:</strong> {req.learningObjective}
                    </p>
                    <p className="text-slate-600 italic">
                      "{req.message}"
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {new Date(req.preferredDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {req.preferredTime} ({req.duration})
                    </span>

                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      {isIncoming ? 'Earn 1 Credit' : 'Costs 1 Credit'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                  {isIncoming && req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(req._id)}
                        disabled={processingId === req._id}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept & Schedule
                      </button>

                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={processingId === req._id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </>
                  )}

                  {!isIncoming && req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      disabled={processingId === req._id}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition"
                    >
                      Cancel Request
                    </button>
                  )}

                  {req.status === 'accepted' && (
                    <Link
                      to="/dashboard/sessions"
                      className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                    >
                      View in Sessions →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
