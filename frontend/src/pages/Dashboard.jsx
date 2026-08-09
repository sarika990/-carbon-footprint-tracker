import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { CardSkeleton, ChartSkeleton, ListSkeleton } from '../components/LoadingSkeleton';
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Flame, Leaf, Save, AlertCircle, ArrowRight,
  PlusCircle, Trash2, Calendar
} from 'lucide-react';

const COLORS = {
  'Car': '#E11D48',
  'Bike/Motorcycle': '#F59E0B',
  'Bus': '#3B82F6',
  'Train/Metro': '#8B5CF6',
  'Carpool': '#06B6D4',
  'Bicycle': '#10B981',
  'Walk': '#047857',
};

const TRANSPORT_EMOJIS = {
  'Car': '🚗',
  'Bike/Motorcycle': '🏍️',
  'Bus': '🚌',
  'Train/Metro': '🚇',
  'Carpool': '👥',
  'Bicycle': '🚲',
  'Walk': '🚶',
};

const Dashboard = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [chartRange, setChartRange] = useState('7');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(true);
      showToast('Error loading dashboard', 'error', 'Could not retrieve data from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteTrip = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/trips/${id}`);
        showToast('Trip deleted successfully', 'success');
        fetchDashboardData();
      } catch (err) {
        console.error(err);
        showToast('Failed to delete trip', 'error');
      }
    }
  };

  // Custom Tooltip for recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs">
          <p className="font-semibold mb-1 text-slate-300">{label}</p>
          <div className="space-y-1">
            {payload.map((p, i) => (
              <p key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }}></span>
                {p.name === 'emitted' ? 'Emitted' : 'Saved'}:{' '}
                <span className="font-bold">{p.value} kg CO₂</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 pb-20 md:pb-6 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div><ChartSkeleton /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ListSkeleton /></div>
          <div><ListSkeleton /></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 pb-20 md:pb-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-semibold text-slate-800">Failed to load dashboard</h2>
        <p className="text-slate-500 text-sm">Could not reach the server. Make sure the backend is running.</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-3 bg-forest-500 text-white rounded-xl font-semibold hover:bg-forest-600 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, charts, modeBreakdown, recentTrips, suggestions } = data;
  const isDatabaseEmpty = summary.totalTrips === 0;
  const chartData = chartRange === '7' ? charts.last7Days : charts.last30Days;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 pb-20 md:pb-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-display">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Your daily commute carbon impact at a glance.</p>
        </div>
        <Link
          to="/log-trip"
          className="bg-forest-500 hover:bg-forest-600 active:scale-95 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-forest-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Log a Commute</span>
        </Link>
      </div>

      {isDatabaseEmpty ? (
        /* Empty State */
        <div className="bg-white border border-warm-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-6 mt-10">
          <div className="w-20 h-20 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto">
            <Leaf className="w-10 h-10 text-forest-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-display">No Commutes Logged Yet</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
              Start tracking your daily commutes to see your carbon footprint, streaks, and eco-alternatives.
            </p>
          </div>
          <Link
            to="/log-trip"
            className="inline-flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md"
          >
            <span>Log Your First Commute</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-rose-50 rounded-xl flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Weekly Emissions</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-slate-800 font-display">{summary.totalWeeklyEmitted}</span>
                  <span className="text-sm text-slate-400">kg CO₂</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Last 7 days rolling</p>
              </div>
            </div>

            <div className="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl flex-shrink-0">
                <Save className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total CO₂ Saved</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-emerald-600 font-display">{summary.totalSaved}</span>
                  <span className="text-sm text-slate-400">kg CO₂</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">vs. solo car baseline</p>
              </div>
            </div>

            <div className="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-xl flex-shrink-0">
                <Flame className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Logging Streak</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-amber-500 font-display">{summary.streakCount}</span>
                  <span className="text-sm text-slate-400">days</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Best: {summary.longestStreak} days</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Emissions Area Chart */}
            <div className="lg:col-span-2 bg-white border border-warm-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-800">Carbon Footprint Trend</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Emissions vs savings over time</p>
                </div>
                <div className="flex bg-warm-100 p-1 rounded-xl text-xs font-semibold gap-1">
                  <button
                    onClick={() => setChartRange('7')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${chartRange === '7' ? 'bg-white text-forest-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setChartRange('30')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${chartRange === '30' ? 'bg-white text-forest-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradEmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradSaved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="emitted" name="emitted" stroke="#F43F5E" strokeWidth={2} fill="url(#gradEmitted)" />
                    <Area type="monotone" dataKey="saved" name="saved" stroke="#10B981" strokeWidth={2} fill="url(#gradSaved)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="text-slate-500">CO₂ Emitted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-500">CO₂ Saved</span>
                </div>
              </div>
            </div>

            {/* Mode Donut */}
            <div className="bg-white border border-warm-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-800">Commute Mode Share</h3>
                <p className="text-xs text-slate-400 mt-0.5">Based on all logged trips</p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {modeBreakdown.length > 0 ? (
                  <div className="relative" style={{ width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modeBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {modeBreakdown.map((entry, index) => (
                            <Cell key={index} fill={COLORS[entry.name] || '#94A3B8'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v} trips`]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold font-display text-slate-800">{summary.totalTrips}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">trips</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs text-center">No mode data</div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {modeBreakdown.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[entry.name] || '#94A3B8' }}></span>
                      <span className="text-slate-600">{TRANSPORT_EMOJIS[entry.name] || ''} {entry.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Suggestions + Recent Trips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Smart Suggestions */}
            <div className="bg-white border border-warm-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-800">Smart Suggestions</h3>
                <p className="text-xs text-slate-400 mt-0.5">Greener alternatives for past trips</p>
              </div>

              <div className="flex-1 space-y-3">
                {suggestions.length > 0 ? (
                  suggestions.map((s) => (
                    <div key={s.tripId} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>Switch to {s.suggestedAlternative}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Your {s.distanceKm} km {s.mode} trip on <span className="font-medium">{s.date}</span> could save{' '}
                        <span className="font-bold text-emerald-600">{s.potentialCo2Saved} kg CO₂</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-2">
                    <Leaf className="w-8 h-8 text-emerald-300" />
                    <p className="text-xs text-slate-400 max-w-[180px]">Great job! No high-emission trips to suggest alternatives for.</p>
                  </div>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-warm-100 flex justify-between text-xs">
                  <span className="text-slate-400">Potential savings:</span>
                  <span className="font-bold text-slate-700">{summary.cumulativePotentialSavings} kg CO₂</span>
                </div>
              )}
            </div>

            {/* Recent Trips */}
            <div className="lg:col-span-2 bg-white border border-warm-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">Recent Trips</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Last 5 logged commutes</p>
                </div>
                <Link to="/history" className="text-xs font-semibold text-forest-600 hover:text-forest-700 flex items-center gap-1 hover:underline">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentTrips.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No trips to show.</p>
              ) : (
                <div className="divide-y divide-warm-100">
                  {recentTrips.map((trip) => (
                    <div key={trip.id} className="py-3 flex items-center justify-between gap-4 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-warm-50 border border-warm-100 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                          {TRANSPORT_EMOJIS[trip.mode] || '🚌'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            {trip.mode}
                            <span className="text-xs font-normal text-slate-400">· {trip.distanceKm} km</span>
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {trip.date}
                            {trip.startLocation && trip.endLocation && (
                              <span className="truncate max-w-[160px]"> · {trip.startLocation} → {trip.endLocation}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className={`text-sm font-bold font-display ${trip.co2Emitted > 1 ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {trip.co2Emitted}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-0.5">kg</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
