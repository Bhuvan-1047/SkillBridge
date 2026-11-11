import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  ArrowUp,
  X,
  ShieldCheck,
  FileText,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'disclaimer' | 'guidelines' | null

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const legalContent = {
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            At <strong>SkillBridge</strong>, we value student privacy. This platform is built for peer-to-peer
            knowledge exchange and only collects necessary academic details (such as your name, college, department,
            year of study, and technical skill listings).
          </p>
          <p>
            • <strong>Data Security:</strong> All user passwords are encrypted using industry-standard bcrypt hashing.
            API endpoints are protected via JSON Web Tokens (JWT).
          </p>
          <p>
            • <strong>Information Usage:</strong> Your public profile information is only visible to registered
            students to facilitate finding complementary mentors and scheduling study sessions.
          </p>
          <p>
            • <strong>Third Parties:</strong> We do not sell, rent, or monetize student data with any third-party advertisers.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      icon: FileText,
      content: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            By registering on SkillBridge, you agree to abide by our student community standards:
          </p>
          <p>
            • <strong>Credit-Based Exchange:</strong> Every new student receives 3 initial learning credits. Completing 1 teaching session earns 1 credit, while completing 1 learning session deducts 1 credit.
          </p>
          <p>
            • <strong>Dual Role System:</strong> Every member is entitled to participate as both a teacher and a learner. No monetary payments are solicited or permitted between students.
          </p>
          <p>
            • <strong>Session Integrity:</strong> Both the mentor and the learner must confirm session completion truthfully to maintain fair credit transfers and transaction histories.
          </p>
        </div>
      ),
    },
    disclaimer: {
      title: 'Academic Project Disclaimer',
      icon: AlertCircle,
      content: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>Full Stack Development-2 (FSD-2) Laboratory Project:</strong>
          </p>
          <p>
            SkillBridge is developed as a mandatory practical curriculum project to demonstrate the end-to-end integration of the MERN stack (React.js, Node.js, Express.js, and MongoDB).
          </p>
          <p>
            • All peer learning exchanges, virtual credits, and ratings are simulated for educational demonstration and grading purposes.
          </p>
          <p>
            • Project dependencies adhere strictly to university laboratory standards using JavaScript, REST APIs, and MongoDB ODM.
          </p>
        </div>
      ),
    },
    guidelines: {
      title: 'Student Learning Guidelines',
      icon: BookOpen,
      content: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            To ensure an inspiring and welcoming environment for everyone, please adhere to these core guidelines:
          </p>
          <p>
            • <strong>Be Punctual:</strong> Join scheduled learning sessions on time via the agreed meeting link or campus study room.
          </p>
          <p>
            • <strong>Mutual Respect:</strong> Maintain professional, encouraging, and supportive communication during all peer sessions.
          </p>
          <p>
            • <strong>Constructive Feedback:</strong> Leave honest, helpful reviews to help student mentors grow their teaching skills.
          </p>
        </div>
      ),
    },
  };

  return (
    <>
      <footer className="bg-[#0f172a] text-slate-300 font-sans border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          {/* TOP SECTION: Brand Identification & Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Identification (Left Column) */}
            <div className="md:col-span-6 lg:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  SkillBridge
                </span>
              </div>
              <p className="text-slate-400 text-sm font-normal pt-1">
                Share What You Know. Learn What You Love.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-3 lg:col-span-3">
              <h3 className="text-sm font-bold text-white mb-3.5 tracking-wide">
                Quick Links
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link
                    to="/"
                    onClick={scrollToTop}
                    className="hover:text-white transition duration-150 inline-block"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/explore"
                    className="hover:text-white transition duration-150 inline-block"
                  >
                    Explore Skills
                  </Link>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition duration-150 inline-block"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-white transition duration-150 inline-block"
                  >
                    My Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Disclaimers Column */}
            <div className="md:col-span-3 lg:col-span-4">
              <h3 className="text-sm font-bold text-white mb-3.5 tracking-wide">
                Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-white transition duration-150 text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-white transition duration-150 text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('disclaimer')}
                    className="hover:text-white transition duration-150 text-left"
                  >
                    Disclaimer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('guidelines')}
                    className="hover:text-white transition duration-150 text-left"
                  >
                    Guidelines
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* DIVIDER 1 */}
          <hr className="border-slate-800/80 my-8" />

          {/* MIDDLE SECTION: Contact Information & Social Media Icons */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2 tracking-wide">
                Contact Us
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="mailto:support@skillbridge.edu"
                  className="hover:text-white transition duration-150"
                >
                  support@skillbridge.edu
                </a>
              </div>
            </div>

            {/* Social Media Icons */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 tracking-wide">
                Follow Us
              </h3>
              <div className="flex items-center gap-4 text-slate-400">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="hover:text-white hover:scale-110 transition duration-150"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="hover:text-white hover:scale-110 transition duration-150"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="hover:text-white hover:scale-110 transition duration-150"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="hover:text-white hover:scale-110 transition duration-150"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* DIVIDER 2 */}
          <hr className="border-slate-800/80 my-8" />

          {/* BOTTOM SECTION: Copyright & Back-to-Top Button */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center text-center">
            <p className="text-xs text-slate-500">
              © 2026 SkillBridge. All rights reserved.
            </p>

            {/* Inline Back-to-Top trigger */}
            <button
              onClick={scrollToTop}
              className="mt-3 sm:mt-0 sm:absolute sm:right-0 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition duration-150"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* FLOATING BACK-TO-TOP BUTTON (Appears when scrolled) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-200"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* LEGAL / GUIDELINES POPUP MODAL */}
      {activeModal && legalContent[activeModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              {React.createElement(legalContent[activeModal].icon, {
                className: 'w-5 h-5 text-indigo-600',
              })}
              <h3 className="text-base font-bold text-slate-900">
                {legalContent[activeModal].title}
              </h3>
            </div>

            {legalContent[activeModal].content}

            <div className="mt-6 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
