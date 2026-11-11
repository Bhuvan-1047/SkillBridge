import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { skillService } from '../services/skillService';
import {
  Shield,
  Users,
  BookOpen,
  Plus,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Coins,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Skill Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, skillsRes] = await Promise.all([
        authService.getAllUsers(),
        skillService.getSkills(),
      ]);

      setStudents(usersRes.users || []);
      setSkills(skillsRes.skills || []);
      setCategories(skillsRes.categories || []);
      if (skillsRes.categories && skillsRes.categories.length > 0) {
        setNewSkillCategory(skillsRes.categories[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await authService.toggleUserStatus(userId);
      setSuccess(res.message);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update student status');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await skillService.createSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        description: newSkillDesc,
      });

      setSuccess(`Skill "${newSkillName}" registered in catalog successfully!`);
      setNewSkillName('');
      setNewSkillDesc('');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to register skill');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          System Administration
        </div>
        <h1 className="text-2xl font-black text-slate-900">Admin Control Panel</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Moderate registered students, manage skill categories, and inspect platform health
        </p>
      </div>

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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Registered Students</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{students.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Skills in Catalog</span>
          <p className="text-3xl font-black text-indigo-600 mt-2">{skills.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Skill Categories</span>
          <p className="text-3xl font-black text-purple-600 mt-2">{categories.length}</p>
        </div>
      </div>

      {/* Add New Skill into Catalog Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Register New Skill in Platform Catalog
          </h3>
        </div>

        <form onSubmit={handleAddSkill} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            required
            placeholder="Skill Name (e.g. Next.js, Rust)"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          />

          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Brief skill description..."
            value={newSkillDesc}
            onChange={(e) => setNewSkillDesc(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Add to Catalog
          </button>
        </form>
      </div>

      {/* Student Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Student Management & Moderation
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">College & Department</th>
                  <th className="py-3 px-3">Available Credits</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {student.name}
                      {student.role === 'admin' && (
                        <span className="ml-1.5 text-[10px] font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {student.email}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {student.college} • {student.department}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      🪙 {student.credits?.available ?? 0}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          student.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {student.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(student._id)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition ${
                            student.isActive
                              ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {student.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
