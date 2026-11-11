import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Coins,
  Users,
  Compass,
  Calendar,
  Star,
  Award,
  BookOpen,
  Laptop,
  GraduationCap,
} from 'lucide-react';
import { skillService } from '../services/skillService';
import { authService } from '../services/authService';
import { Footer } from '../components/Footer';

export const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredStudents, setFeaturedStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await skillService.getSkills();
        if (skillsData.categories) {
          setCategories(skillsData.categories);
        }

        const usersData = await authService.getAllUsers();
        if (usersData.users) {
          setFeaturedStudents(usersData.users.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-6 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Full Stack Peer-to-Peer Student Skill Exchange Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Share What You Know.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Learn What You Love.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with fellow students, exchange knowledge, and grow your skills through a
            collaborative learning community powered by a transparent credit-based exchange model.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition duration-150"
            >
              Get Started Free (Get 3 Credits)
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition duration-150"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              Explore Available Skills
            </Link>
          </div>

          {/* Quick Value Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
              <p className="text-2xl font-extrabold text-indigo-600">3 Credits</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Free on Registration</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
              <p className="text-2xl font-extrabold text-purple-600">1:1 Peer</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Personalized Mentoring</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
              <p className="text-2xl font-extrabold text-teal-600">Mutual</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Skill Match Engine</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
              <p className="text-2xl font-extrabold text-amber-600">100% Free</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Student Knowledge Sharing</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              How SkillBridge Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every student is both a teacher and a learner. Exchange knowledge through a
              fair credit ledger.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-start relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">List Your Skills</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Add skills you can teach (e.g. Python, UI design) and skills you want to learn.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-start relative">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Find Matching Peers</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Our complementary matching algorithm pairs students with mutual learning interests.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-start relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Schedule Sessions</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Agree on dates, times, and meeting links. 1 credit is safely reserved upon acceptance.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-start relative">
              <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-800">Earn & Spend Credits</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Both students confirm completion. 1 credit transfers to the teacher automatically!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR SKILL CATEGORIES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Explore Diverse Domains
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Popular Skill Categories
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Browse all skills <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/explore?category=${encodeURIComponent(cat)}`}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                  {cat}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED STUDENT MENTORS */}
      {featuredStudents.length > 0 && (
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Peer Community
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Meet Fellow Student Mentors
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Students actively teaching and exchanging skills across colleges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStudents.map((student) => (
                <div
                  key={student._id}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                        <p className="text-xs text-slate-500">{student.college}</p>
                        <span className="text-[10px] text-indigo-600 font-semibold">
                          {student.department} • {student.year}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-4 italic line-clamp-2">
                      "{student.bio}"
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">
                      🪙 {student.credits?.available} Available Credits
                    </span>
                    <Link
                      to={`/users/${student._id}`}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. CALL TO ACTION */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Ready to Swap Skills and Accelerate Your Learning?
            </h2>
            <p className="mt-3 text-sm text-indigo-100 max-w-xl mx-auto">
              Join your fellow students today. Create an account in 30 seconds and receive 3 free
              initial learning credits immediately.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="px-6 py-3 text-xs font-bold text-indigo-700 bg-white hover:bg-slate-50 rounded-xl shadow-md transition"
              >
                Sign Up as a Student
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 text-xs font-bold text-white border border-white/40 hover:bg-white/10 rounded-xl transition"
              >
                Log In to Your Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};
