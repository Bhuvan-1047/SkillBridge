import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { skillService } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import { SkillCard } from '../components/SkillCard';
import { RequestModal } from '../components/RequestModal';
import {
  Search,
  Filter,
  Compass,
  CheckCircle,
  X,
  Laptop,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

export const ExploreSkillsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  // Selected Listing for Request Modal
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [proficiency, setProficiency] = useState(searchParams.get('proficiency') || '');
  const [college, setCollege] = useState(searchParams.get('college') || '');
  const [mode, setMode] = useState(searchParams.get('mode') || 'all');

  const fetchExploreListings = async () => {
    try {
      setLoading(true);
      const params = {
        type: 'teach', // Browse skills others can teach
        excludeUser: true,
      };

      if (search) params.search = search;
      if (category) params.category = category;
      if (proficiency) params.proficiency = proficiency;
      if (college) params.college = college;
      if (mode && mode !== 'all') params.mode = mode;

      const [listingsRes, skillsRes] = await Promise.all([
        skillService.getSkillListings(params),
        skillService.getSkills(),
      ]);

      setListings(listingsRes.listings || []);
      setCategories(skillsRes.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to load skill listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreListings();
  }, [category, proficiency, mode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExploreListings();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setProficiency('');
    setCollege('');
    setMode('all');
    setSearchParams({});
    setTimeout(fetchExploreListings, 50);
  };

  const handleRequestClick = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleRequestSuccess = () => {
    setRequestSuccess('Your learning request has been successfully submitted to the mentor!');
    setTimeout(() => setRequestSuccess(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Explore Teaching Skills</h1>
        <p className="text-xs text-slate-500 mt-1">
          Discover student mentors across colleges, filter by proficiency, and request 1-on-1 learning sessions
        </p>
      </div>

      {requestSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{requestSuccess}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill name (e.g. Python, React), topic, or student mentor..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="relative sm:w-60">
            <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="Filter by college name..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            Filters:
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Proficiency */}
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white"
          >
            <option value="">All Proficiencies</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>

          {/* Mode */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white"
          >
            <option value="all">All Modes (Online & Offline)</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
          </select>

          {(search || category || proficiency || college || mode !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Compass className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No matching skills found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords, clearing categories, or removing college filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <SkillCard
              key={listing._id}
              listing={listing}
              onRequest={handleRequestClick}
              isOwner={
                (listing.userId?._id || listing.userId)?.toString() ===
                (user?._id || user?.id)?.toString()
              }
            />
          ))}
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
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};
