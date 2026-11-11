import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { useAuth } from '../context/AuthContext';
import { RequestModal } from '../components/RequestModal';
import {
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Send,
  MapPin,
  RefreshCw,
  Award,
  CheckCircle,
} from 'lucide-react';

export const FindPartnersPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [mutualCount, setMutualCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await matchService.getMatches();
      setMatches(data.matches || []);
      setMutualCount(data.mutualCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to compute partner matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRequestPartner = (partner, skillItem) => {
    // Construct pseudo listing object for RequestModal
    setSelectedListing({
      userId: partner,
      skillId: skillItem.skill,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Rule-Based Complementary Matching
          </div>
          <h1 className="text-2xl font-black text-slate-900">Find Learning Partners</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover peers whose skills complement yours for mutual 1-on-1 knowledge exchange
          </p>
        </div>

        <button
          onClick={fetchMatches}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Matches
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Explanatory Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-indigo-100 text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-950">How Complementary Matching Works</h4>
            <p className="text-slate-600 mt-0.5">
              We compare your teaching skills with other students' desired skills, and vice versa.
              {mutualCount > 0 && (
                <strong className="text-indigo-700 font-bold ml-1">
                  You have {mutualCount} perfect mutual match{mutualCount > 1 ? 'es' : ''}!
                </strong>
              )}
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/skills"
          className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 rounded-xl border border-indigo-200 shrink-0 transition"
        >
          Manage My Skills →
        </Link>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No complementary matches yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Add more skills you can teach and skills you want to learn so we can match you with suitable learning partners!
          </p>
          <Link
            to="/dashboard/skills"
            className="inline-block mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-xs hover:bg-indigo-700"
          >
            Add Skills in My Skills
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((match) => {
            const partner = match.student;

            return (
              <div
                key={partner._id}
                className={`bg-white rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                  match.isMutual
                    ? 'border-emerald-300/80 ring-2 ring-emerald-500/10'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top Partner Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                        {partner.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{partner.name}</h3>
                          {match.isMutual ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Mutual Match 🔄
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {match.matchType}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {partner.college}
                        </p>
                        <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                          {partner.department} • {partner.year}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Complementary Exchange Matrix */}
                  <div className="py-4 space-y-3">
                    {/* What they can teach you */}
                    {match.iWantFromThem.length > 0 && (
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                        <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          They can teach you what you want:
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {match.iWantFromThem.map((item) => (
                            <div
                              key={item.skill._id}
                              className="px-2.5 py-1 bg-white rounded-lg border border-purple-200 text-xs font-semibold text-purple-950 flex items-center justify-between gap-2 shadow-xs"
                            >
                              <span>{item.skill.name}</span>
                              <button
                                onClick={() => handleRequestPartner(partner, item)}
                                className="px-2 py-0.5 text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition"
                              >
                                Request
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What you can teach them */}
                    {match.theyWantFromMe.length > 0 && (
                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          They want to learn your skill:
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {match.theyWantFromMe.map((item) => (
                            <span
                              key={item.skill._id}
                              className="px-2.5 py-1 bg-white rounded-lg border border-indigo-200 text-xs font-semibold text-indigo-950 shadow-xs"
                            >
                              {item.skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {partner.bio && (
                      <p className="text-xs text-slate-500 italic px-1">
                        "{partner.bio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/users/${partner._id}`}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View Complete Profile →
                  </Link>

                  {match.iWantFromThem.length > 0 && (
                    <button
                      onClick={() => handleRequestPartner(partner, match.iWantFromThem[0])}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request {match.iWantFromThem[0].skill.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal */}
      {selectedListing && (
        <RequestModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedListing(null);
          }}
          targetListing={selectedListing}
          onSuccess={() => {
            setSuccessMsg('Learning request sent to your matched peer!');
            setTimeout(() => setSuccessMsg(''), 6000);
          }}
        />
      )}
    </div>
  );
};
