import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Trophy, Flame, Shield, MapPin, Leaf, TrendingDown,
  Lock, Calendar, CheckCircle2, LogOut, AlertCircle
} from 'lucide-react';

const ALL_BADGES = [
  {
    name: 'First Commute',
    description: 'Log your very first trip on CarbonPath.',
    requirement: 'Log 1 trip',
    icon: MapPin,
    colorClass: 'bg-green-100 text-green-700 border-green-200',
    earnedColorClass: 'bg-green-500/10 border-green-400/30',
  },
  {
    name: 'Eco Rookie',
    description: 'Save your first 5 kg of operational CO₂.',
    requirement: 'Save 5 kg CO₂',
    icon: Leaf,
    colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    earnedColorClass: 'bg-emerald-500/10 border-emerald-400/30',
  },
  {
    name: 'Carbon Cutter',
    description: 'Reduce your carbon footprint by 15 kg.',
    requirement: 'Save 15 kg CO₂',
    icon: TrendingDown,
    colorClass: 'bg-teal-100 text-teal-700 border-teal-200',
    earnedColorClass: 'bg-teal-500/10 border-teal-400/30',
  },
  {
    name: 'Eco Warrior',
    description: 'Prevent 50 kg of CO₂ from entering the atmosphere.',
    requirement: 'Save 50 kg CO₂',
    icon: Shield,
    colorClass: 'bg-blue-100 text-blue-700 border-blue-200',
    earnedColorClass: 'bg-blue-500/10 border-blue-400/30',
  },
  {
    name: 'Consistent Commuter',
    description: 'Maintain a logging streak of 5 consecutive days.',
    requirement: '5-Day Streak',
    icon: Flame,
    colorClass: 'bg-orange-100 text-orange-700 border-orange-200',
    earnedColorClass: 'bg-orange-500/10 border-orange-400/30',
  },
  {
    name: 'Streak Master',
    description: 'Reach a legendary logging streak of 10 days.',
    requirement: '10-Day Streak',
    icon: Trophy,
    colorClass: 'bg-amber-100 text-amber-700 border-amber-200',
    earnedColorClass: 'bg-amber-500/10 border-amber-400/30',
  },
];

const Badges = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [stats, setStats] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const [statsRes, badgesRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/user/badges'),
      ]);
      setStats(statsRes.data.summary);
      setEarnedBadges(badgesRes.data || []);
    } catch (err) {
      console.error(err);
      setFetchError(true);
      showToast('Error loading achievements', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    logout();
    showToast('Signed out', 'info', 'See you soon!');
    navigate('/auth');
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4 pb-20 md:pb-6 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-warm-200 rounded-2xl p-4 animate-pulse h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-warm-200 rounded-2xl p-5 animate-pulse h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (fetchError || !stats) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4 pb-20 md:pb-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-10 h-10 text-rose-400" />
        <p className="text-slate-500 text-sm">Failed to load your achievements.</p>
        <button onClick={fetchData} className="px-6 py-3 bg-forest-500 text-white rounded-xl font-semibold hover:bg-forest-600 transition-all text-sm">
          Retry
        </button>
      </div>
    );
  }

  const earnedNames = new Set(earnedBadges.map((b) => b.name));
  const earnedCount = ALL_BADGES.filter((b) => earnedNames.has(b.name)).length;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 pb-20 md:pb-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 font-display">Achievements</h1>
        <p className="text-sm text-slate-500 mt-1">Track your eco-streaks and unlock milestones.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Current Streak</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold font-display text-amber-500">{stats.streakCount}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">days</p>
        </div>

        <div className="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Best Streak</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Trophy className="w-5 h-5 text-slate-600" />
            <span className="text-2xl font-bold font-display text-slate-700">{stats.longestStreak}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">days</p>
        </div>

        <div className="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">CO₂ Saved</p>
          <span className="text-2xl font-bold font-display text-emerald-600 mt-2 block">{stats.totalSaved}</span>
          <p className="text-xs text-slate-400 mt-1">kg CO₂</p>
        </div>

        <div className="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Badges Earned</p>
          <span className="text-2xl font-bold font-display text-forest-600 mt-2 block">{earnedCount} / {ALL_BADGES.length}</span>
          <p className="text-xs text-slate-400 mt-1">milestones</p>
        </div>
      </div>

      {/* Badges Grid */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Milestone Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_BADGES.map((badge) => {
          const earned = earnedBadges.find((b) => b.name === badge.name);
          const Icon = badge.icon;

          return (
            <div
              key={badge.name}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-200 relative flex flex-col ${
                earned ? 'border-warm-200 hover:-translate-y-0.5 hover:shadow-md' : 'border-slate-100 opacity-55'
              }`}
            >
              {/* Earned check / lock badge */}
              <div className="absolute top-4 right-4">
                {earned ? (
                  <span className="text-emerald-500 bg-emerald-50 p-1 rounded-full block">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="text-slate-400 bg-slate-100 p-1.5 rounded-xl block border border-slate-200">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Badge icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm flex-shrink-0 ${
                earned ? badge.colorClass : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="mt-4 flex-1">
                <h4 className="font-semibold text-slate-800 font-display">{badge.name}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{badge.description}</p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
                {earned ? (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(earned.earnedAt)}
                  </span>
                ) : (
                  <>
                    <span className="text-slate-400">Target:</span>
                    <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{badge.requirement}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile logout */}
      <div className="md:hidden mt-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white border border-warm-200 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 shadow-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Badges;
