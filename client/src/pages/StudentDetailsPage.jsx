import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { RequestModal } from '../components/RequestModal';
import {
  User,
  GraduationCap,
  MapPin,
  Star,
  BookOpen,
  Sparkles,
  Send,
  Calendar,
  CheckCircle,
  Clock,
  Laptop,
} from 'lucide-react';

export const StudentDetailsPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getUserById(id);
      if (data.success) {
        setStudent(data.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudentProfile();
    }
  }, [id]);

  const handleRequestClick = (listing) => {
    setSelectedListing({
      ...listing,
      userId: student,
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-10">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Student Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'This student profile does not exist.'}</p>
        <Link
          to="/explore"
          className="inline-block mt-4 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl"
        >
          Back to Explore Skills
        </Link>
      </div>
    );
  }

  const isSelf =
    (currentUser?._id || currentUser?.id)?.toString() ===
    (student?._id || student?.id)?.toString();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{student.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 capitalize">
                  {student.role || 'Student'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {student.college}
              </p>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                {student.department} • {student.year}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{student.avgRating || 'New'}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Rating</span>
            </div>

            <div className="text-center">
              <span className="text-lg font-bold text-slate-900">
                {student.totalTeachingSessions ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Taught</p>
            </div>

            <div className="text-center">
              <span className="text-lg font-bold text-slate-900">
                {student.totalLearningSessions ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Learned</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              About Student
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {student.bio}
            </p>
          </div>
        )}
      </div>

      {/* Skills Offered (Teaching) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Skills {student.name} Can Teach ({student.teachingSkills?.length || 0})
            </h3>
          </div>
        </div>

        {student.teachingSkills?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No active teaching skills listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {student.teachingSkills?.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-800">
                      {item.skillId?.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {item.proficiency}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {item.skillId?.category}
                  </span>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.sessionDuration}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 capitalize">
                      <Laptop className="w-3 h-3 text-slate-400" />
                      {item.mode}
                    </span>
                  </div>
                </div>

                {!isSelf && (
                  <button
                    onClick={() => handleRequestClick(item)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    Request 1-on-1 Session (1 Credit)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills Wanted (Learning Interests) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-base font-extrabold text-slate-900">
            Skills {student.name} Wants to Learn ({student.learningSkills?.length || 0})
          </h3>
        </div>

        {student.learningSkills?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No learning interests listed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {student.learningSkills?.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-950">
                    {item.skillId?.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {item.proficiency}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Peer Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <h3 className="text-base font-extrabold text-slate-900">
            Peer Feedback & Reviews ({student.reviews?.length || 0})
          </h3>
        </div>

        {student.reviews?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No reviews submitted yet for this student.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {student.reviews?.map((rev) => (
              <div key={rev._id} className="py-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {rev.reviewerId?.name} ({rev.reviewerId?.college})
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
            setSuccessMsg('Your request was submitted successfully!');
            setTimeout(() => setSuccessMsg(''), 6000);
          }}
        />
      )}
    </div>
  );
};
