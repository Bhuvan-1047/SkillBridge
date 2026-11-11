import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { skillService } from '../services/skillService';
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Laptop,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';

export const MySkillsPage = () => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [activeTab, setActiveTab] = useState('teach'); // 'teach' or 'learn'
  const [teachListings, setTeachListings] = useState([]);
  const [learnListings, setLearnListings] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [formData, setFormData] = useState({
    skillId: '',
    customSkillName: '',
    category: 'Programming',
    proficiency: 'Intermediate',
    experience: '',
    description: '',
    availability: 'Weekdays after 5 PM',
    sessionDuration: '60 mins',
    mode: 'online',
  });

  const fetchMySkills = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        skillService.getSkillListings({ userId: currentUserId, type: 'teach' }),
        skillService.getSkillListings({ userId: currentUserId, type: 'learn' }),
        skillService.getSkills(),
      ]);

      const [teachResult, learnResult, skillsResult] = results;
      const failedLoads = [];

      if (teachResult.status === 'fulfilled') {
        setTeachListings(teachResult.value.listings || []);
      } else {
        console.error('Failed to load teaching skills:', teachResult.reason);
        failedLoads.push('teaching skills');
      }

      if (learnResult.status === 'fulfilled') {
        setLearnListings(learnResult.value.listings || []);
      } else {
        console.error('Failed to load learning interests:', learnResult.reason);
        failedLoads.push('learning interests');
      }

      if (skillsResult.status === 'fulfilled') {
        setAvailableSkills(skillsResult.value.skills || []);
        setCategories(skillsResult.value.categories || []);
      } else {
        console.error('Failed to load the skill catalog:', skillsResult.reason);
        failedLoads.push('skill catalog');
      }

      setLoadErrors(failedLoads);
    } catch (err) {
      setError(err.message || 'Failed to fetch your skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchMySkills();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  const handleOpenAddModal = () => {
    setEditingListing(null);
    setFormData({
      skillId: availableSkills[0]?._id || '',
      customSkillName: '',
      category: 'Programming',
      proficiency: 'Intermediate',
      experience: '',
      description: '',
      availability: 'Weekdays after 5 PM',
      sessionDuration: '60 mins',
      mode: 'online',
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (listing) => {
    setEditingListing(listing);
    setFormData({
      skillId: listing.skillId?._id || '',
      customSkillName: '',
      category: listing.skillId?.category || 'Programming',
      proficiency: listing.proficiency,
      experience: listing.experience || '',
      description: listing.description,
      availability: listing.availability || '',
      sessionDuration: listing.sessionDuration || '60 mins',
      mode: listing.mode || 'online',
    });
    setError('');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingListing) {
        // Update existing listing
        await skillService.updateSkillListing(editingListing._id, {
          proficiency: formData.proficiency,
          experience: formData.experience,
          description: formData.description,
          availability: formData.availability,
          sessionDuration: formData.sessionDuration,
          mode: formData.mode,
        });
        setSuccess('Skill listing updated successfully!');
      } else {
        // Create new listing
        const payload = {
          type: activeTab,
          proficiency: formData.proficiency,
          experience: formData.experience,
          description: formData.description,
          availability: formData.availability,
          sessionDuration: formData.sessionDuration,
          mode: formData.mode,
        };

        if (formData.customSkillName) {
          payload.skillName = formData.customSkillName;
          payload.category = formData.category;
        } else {
          payload.skillId = formData.skillId;
        }

        await skillService.createSkillListing(payload);
        setSuccess(`New ${activeTab === 'teach' ? 'teaching' : 'learning'} skill added successfully!`);
      }

      setModalOpen(false);
      await fetchMySkills();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill listing?')) return;
    try {
      await skillService.deleteSkillListing(id);
      setSuccess('Skill listing deleted successfully');
      await fetchMySkills();
    } catch (err) {
      setError(err.message || 'Failed to delete listing');
    }
  };

  const currentListings = activeTab === 'teach' ? teachListings : learnListings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Skill Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage what you can teach to earn credits and what you want to learn from peers
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'teach' ? 'Teaching Skill' : 'Learning Interest'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('teach');
            setError('');
            setSuccess('');
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'teach'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Skills I Can Teach ({teachListings.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('learn');
            setError('');
            setSuccess('');
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'learn'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Skills I Want to Learn ({learnListings.length})
        </button>
      </div>

      {/* Alerts */}
      {loadErrors.length > 0 && (
        <div className="p-3.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Could not load {loadErrors.join(', ')}. Other available skill information is still
            shown; please refresh to try again.
          </span>
        </div>
      )}

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

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : currentListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            {activeTab === 'teach' ? <BookOpen className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            No {activeTab === 'teach' ? 'teaching' : 'learning'} skills added yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'teach'
              ? 'Add skills you are proficient in to become visible to fellow students and earn credits!'
              : 'Add skills you want to learn so our matching algorithm can recommend the best student mentors.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
          >
            + Add First {activeTab === 'teach' ? 'Teaching Skill' : 'Learning Interest'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentListings.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {item.skillId?.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {item.proficiency}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  Category: {item.skillId?.category}
                </span>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {item.experience && (
                  <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{item.experience}"
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.sessionDuration}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md capitalize">
                    <Laptop className="w-3 h-3 text-slate-400" />
                    {item.mode}
                  </span>
                  {item.availability && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.availability}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit & Delete Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                  title="Edit Listing"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {editingListing ? 'Edit Skill Listing' : `Add ${activeTab === 'teach' ? 'Teaching Skill' : 'Learning Interest'}`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {!editingListing && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Skill from Catalog
                  </label>
                  <select
                    value={formData.skillId}
                    onChange={(e) => setFormData({ ...formData, skillId: e.target.value, customSkillName: '' })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {availableSkills.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">or type a new custom skill name:</span>
                  </div>
                  <input
                    type="text"
                    value={formData.customSkillName}
                    onChange={(e) => setFormData({ ...formData, customSkillName: e.target.value, skillId: '' })}
                    placeholder="e.g. Next.js, Blender, Cyber Security"
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />

                  {formData.customSkillName && (
                    <div className="mt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Category for Custom Skill
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proficiency Level *
                  </label>
                  <select
                    value={formData.proficiency}
                    onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Session Duration
                  </label>
                  <select
                    value={formData.sessionDuration}
                    onChange={(e) => setFormData({ ...formData, sessionDuration: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experience / Background
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 2 years coursework, built 3 full-stack projects"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Topics Covered *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you plan to teach or what topics you want guidance on..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available Days / Time
                  </label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g. Weekends, Mon & Wed after 5 PM"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mode
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="online">Online (Video Meet)</option>
                    <option value="offline">Offline (Campus)</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {editingListing ? 'Save Changes' : 'Add Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
