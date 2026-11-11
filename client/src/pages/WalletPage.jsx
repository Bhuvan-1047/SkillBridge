import React, { useState, useEffect } from 'react';
import { walletService } from '../services/walletService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  RotateCcw,
  Sparkles,
  History,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Gift,
  HeartHandshake,
  X,
  Search,
  User,
} from 'lucide-react';

export const WalletPage = () => {
  const { user, refreshUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  // Donation State
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [donationAmount, setDonationAmount] = useState(1);
  const [donationMessage, setDonationMessage] = useState('');
  const [donating, setDonating] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState('');
  const [donateError, setDonateError] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        walletService.getWallet(),
        walletService.getHistory(filterType ? { type: filterType } : {}),
      ]);

      if (walletRes.success) setWallet(walletRes.wallet);
      if (txRes.success) setTransactions(txRes.transactions);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await authService.getAllUsers();
      if (res.success && res.users) {
        // Exclude current logged in student
        const others = res.users.filter(
          (u) => u._id.toString() !== (user?._id || user?.id)?.toString()
        );
        setStudents(others);
      }
    } catch (err) {
      console.error('Failed to fetch students for donation:', err);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [filterType]);

  const handleOpenDonate = () => {
    fetchStudents();
    setDonateError('');
    setDonateSuccess('');
    setIsDonateOpen(true);
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipientId) {
      setDonateError('Please select a student recipient.');
      return;
    }
    const amount = Number(donationAmount);
    const available = wallet?.available ?? user?.credits?.available ?? 0;
    if (amount <= 0 || amount > available) {
      setDonateError(`Donation amount must be between 1 and ${available} credits.`);
      return;
    }

    try {
      setDonating(true);
      setDonateError('');
      const res = await walletService.donateCredits({
        recipientId: selectedRecipientId,
        amount,
        message: donationMessage,
      });

      if (res.success) {
        setIsDonateOpen(false);
        setDonateSuccess(res.message || 'Donation sent successfully!');
        setSelectedRecipientId('');
        setDonationAmount(1);
        setDonationMessage('');
        await fetchWalletData();
        setTimeout(() => setDonateSuccess(''), 6000);
      }
    } catch (err) {
      setDonateError(err.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'Earned credits':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Initial credits':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Refunded credits':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Reserved credits':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Spent credits':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Donation sent':
        return 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
      case 'Donation received':
        return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = studentSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.college?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term)
    );
  });

  const availableCredits = wallet?.available ?? user?.credits?.available ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Donate Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Student Credit Wallet</h1>
          <p className="text-xs text-slate-500 mt-1">
            SkillBridge operates on a transparent credit-based model. Earn credits by teaching, spend them to learn, or donate to peers.
          </p>
        </div>

        <button
          onClick={handleOpenDonate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-200 transition duration-150 self-start sm:self-auto"
        >
          <Gift className="w-4 h-4" />
          <span>Donate Credits to Peer</span>
        </button>
      </div>

      {donateSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{donateSuccess}</span>
        </div>
      )}

      {/* 4 Wallet Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Credits */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-200/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Available Credits
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black">{availableCredits}</span>
            <p className="text-xs text-amber-100 mt-1">
              Ready to book sessions or donate
            </p>
          </div>
        </div>

        {/* Reserved Credits */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reserved Credits
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">
              {wallet?.reserved ?? user?.credits?.reserved ?? 0}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Held for scheduled upcoming sessions
            </p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Earned
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-700">
              +{wallet?.earned ?? user?.credits?.earned ?? 0}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Earned from completed teaching
            </p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Spent
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-rose-700">
              -{wallet?.spent ?? user?.credits?.spent ?? 0}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Invested into learning from peers
            </p>
          </div>
        </div>
      </div>

      {/* Community Learning & Donation Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-3xl border border-purple-200/80 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Credit Donation & Community Learning
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Support peers who have fewer opportunities to teach or need starter credits to book critical mentoring sessions.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenDonate}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
        >
          Send Donation 🎁
        </button>
      </div>

      {/* Credit Rules Explanatory Box for FSD-2 Lab Viva */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            How the SkillBridge Credit System Operates (Core Mechanism)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <strong className="text-indigo-900 block font-bold mb-1">1. Welcome Grant</strong>
            Every newly registered student receives 3 initial credits to start exploring peer learning immediately.
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <strong className="text-indigo-900 block font-bold mb-1">2. Credit Reservation</strong>
            When a teacher accepts your session request, 1 credit is held in "Reserved" status to guarantee attendance.
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <strong className="text-indigo-900 block font-bold mb-1">3. Completion Transfer</strong>
            After both participants confirm completion, the 1 credit transfers to the teacher's available balance!
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <strong className="text-indigo-900 block font-bold mb-1">4. Community Donation</strong>
            Experienced teachers can donate spare credits to help fellow learners access vital mentoring sessions.
          </div>
        </div>
      </div>

      {/* Full Transaction History Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Permanent Credit Audit Ledger
            </h3>
          </div>

          {/* Filter by Type */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white"
            >
              <option value="">All Transactions</option>
              <option value="Initial credits">Initial credits</option>
              <option value="Earned credits">Earned credits</option>
              <option value="Spent credits">Spent credits</option>
              <option value="Reserved credits">Reserved credits</option>
              <option value="Refunded credits">Refunded credits</option>
              <option value="Donation sent">Donations sent</option>
              <option value="Donation received">Donations received</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No transaction records match the criteria.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description & Peer</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTransactionBadge(
                          tx.type
                        )}`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 max-w-md">
                      <div>
                        <span>{tx.description}</span>
                        {tx.relatedUser && (
                          <span className="block text-[11px] text-indigo-600 font-semibold mt-0.5">
                            Peer: {tx.relatedUser.name} ({tx.relatedUser.college})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-black font-mono text-xs ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credit
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREDIT DONATION MODAL */}
      {isDonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsDonateOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Donate Credits to Student</h3>
                <p className="text-[11px] text-slate-400">
                  Empower peers in your college community
                </p>
              </div>
            </div>

            {donateError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {donateError}
              </div>
            )}

            <form onSubmit={handleDonateSubmit} className="space-y-4 text-xs">
              {/* Recipient Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Recipient Student *
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students by name or college..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {filteredStudents.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">
                      No matching students found
                    </p>
                  ) : (
                    filteredStudents.map((st) => (
                      <div
                        key={st._id}
                        onClick={() => setSelectedRecipientId(st._id)}
                        className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                          selectedRecipientId === st._id
                            ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{st.name}</p>
                          <p className="text-[10px] text-slate-400">{st.college} • {st.department}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          🪙 {st.credits?.available ?? 0}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Credit Amount to Donate *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={availableCredits}
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-sm"
                  />
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDonationAmount(val)}
                        disabled={val > availableCredits}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl font-bold text-xs"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 ml-auto">
                    Max: {availableCredits} credits
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Supportive Message (Optional)
                </label>
                <input
                  type="text"
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  placeholder="e.g. Keep learning! Hope this helps with your upcoming project."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 space-y-1">
                <div className="flex justify-between">
                  <span>Current Available:</span>
                  <span className="font-bold">{availableCredits} Credits</span>
                </div>
                <div className="flex justify-between text-purple-700 font-bold">
                  <span>Donation:</span>
                  <span>-{donationAmount || 0} Credits</span>
                </div>
                <div className="flex justify-between border-t border-indigo-200/50 pt-1 font-extrabold">
                  <span>Balance After Donation:</span>
                  <span>{Math.max(0, availableCredits - (donationAmount || 0))} Credits</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDonateOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={donating || availableCredits < 1}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {donating ? 'Processing...' : 'Confirm & Donate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
