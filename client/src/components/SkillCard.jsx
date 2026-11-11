import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Calendar,
  Send,
  User,
  Sparkles,
  Laptop,
} from 'lucide-react';

export const SkillCard = ({ listing, onRequest, isOwner = false }) => {
  const teacher = listing.userId;
  const skill = listing.skillId;

  const getProficiencyColor = (level) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Advanced':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Student Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <Link
            to={`/users/${teacher?._id}`}
            className="flex items-center gap-2.5 group-hover:text-indigo-600 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {teacher?.name ? teacher.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate transition">
                {teacher?.name || 'Student Mentor'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {teacher?.college || 'University Student'}
              </p>
            </div>
          </Link>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getProficiencyColor(
              listing.proficiency
            )}`}
          >
            {listing.proficiency}
          </span>
        </div>

        {/* Skill Details */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition truncate">
              {skill?.name || 'Skill Listing'}
            </h3>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
              {skill?.category}
            </span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>

          {listing.experience && (
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-1">
              "Experience: {listing.experience}"
            </p>
          )}

          {/* Availability & Mode pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
              <Clock className="w-3 h-3 text-slate-400" />
              {listing.sessionDuration || '45-60 mins'}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md capitalize">
              <Laptop className="w-3 h-3 text-slate-400" />
              {listing.mode}
            </span>

            {listing.availability && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md truncate max-w-[150px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                {listing.availability}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/users/${teacher?._id}`}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
        >
          View Profile
        </Link>

        {!isOwner && (
          <button
            onClick={() => onRequest && onRequest(listing)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition duration-150"
          >
            <Send className="w-3 h-3" />
            Request Session
          </button>
        )}
      </div>
    </div>
  );
};
