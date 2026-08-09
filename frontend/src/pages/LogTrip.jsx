import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Navigation, Info, ShieldAlert, ArrowRight, Leaf } from 'lucide-react';

const EMISSION_FACTORS = {
  'Car': 0.192,
  'Bike/Motorcycle': 0.103,
  'Bus': 0.105,
  'Train/Metro': 0.041,
  'Carpool': 0.048,
  'Bicycle': 0.0,
  'Walk': 0.0,
};

const TRANSPORT_OPTIONS = [
  { value: 'Car', label: '🚗 Car (Petrol, Solo)' },
  { value: 'Bike/Motorcycle', label: '🏍️ Bike / Motorcycle' },
  { value: 'Bus', label: '🚌 Bus' },
  { value: 'Train/Metro', label: '🚇 Train / Metro' },
  { value: 'Carpool', label: '👥 Carpool (Shared Ride)' },
  { value: 'Bicycle', label: '🚲 Bicycle' },
  { value: 'Walk', label: '🚶 Walk' },
];

const LogTrip = () => {
  const { showToast } = useToast();
  const { updateUserStats } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('Car');
  const [distanceKm, setDistanceKm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projectedCo2, setProjectedCo2] = useState(0);
  const [projectedSaved, setProjectedSaved] = useState(0);

  useEffect(() => {
    const dist = parseFloat(distanceKm);
    if (!isNaN(dist) && dist > 0) {
      const factor = EMISSION_FACTORS[mode] ?? 0;
      const co2 = dist * factor;
      const carBaseline = dist * 0.192;
      setProjectedCo2(Number(co2.toFixed(3)));
      setProjectedSaved(Number(Math.max(0, carBaseline - co2).toFixed(3)));
    } else {
      setProjectedCo2(0);
      setProjectedSaved(0);
    }
  }, [mode, distanceKm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const dist = parseFloat(distanceKm);
    if (isNaN(dist) || dist <= 0) {
      setError('Distance must be a positive number greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/trips', {
        mode,
        distanceKm: dist,
        date,
        startLocation: startLocation.trim() || undefined,
        endLocation: endLocation.trim() || undefined,
      });

      showToast('Trip logged!', 'success', `${dist} km via ${mode} — ${projectedCo2} kg CO₂.`);

      if (res.data?.streak && res.data.streak.updated) {
        updateUserStats(res.data.streak);
      }

      if (Array.isArray(res.data?.newBadges) && res.data.newBadges.length > 0) {
        res.data.newBadges.forEach((badge) => {
          setTimeout(() => showToast(badge, 'badge'), 500);
        });
      }

      navigate('/');
    } catch (err) {
      console.error('Log trip error:', err);
      const msg = err.response?.data?.error || 'Failed to log trip. Please try again.';
      setError(msg);
      showToast('Logging failed', 'error', msg);
    } finally {
      setLoading(false);
    }
  };

  const isEcoMode = EMISSION_FACTORS[mode] === 0;
  const isLowEmission = EMISSION_FACTORS[mode] < 0.1 && EMISSION_FACTORS[mode] > 0;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 pb-20 md:pb-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 font-display">Log a Commute</h1>
        <p className="text-sm text-slate-500 mt-1">Record your travel details to calculate its carbon footprint.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white border border-warm-200 rounded-2xl p-6 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-start gap-2.5 text-sm mb-5">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                  />
                </div>
              </div>

              {/* Transport Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode of Transport *</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                >
                  {TRANSPORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Distance (km) *</label>
              <div className="relative">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-45" />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="w-full pl-10 pr-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                />
              </div>
              {distanceKm && !isNaN(parseFloat(distanceKm)) && parseFloat(distanceKm) > 0 && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  {isEcoMode ? (
                    <><span className="text-emerald-600 font-medium">Zero emissions!</span> Great choice.</>
                  ) : isLowEmission ? (
                    <><span className="text-amber-600 font-medium">Low emission</span> transport mode.</>
                  ) : (
                    <><span className="text-rose-600 font-medium">Higher emission</span> — consider alternatives where possible.</>
                  )}
                </p>
              )}
            </div>

            {/* Optional locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Location <span className="normal-case font-normal">(optional)</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="e.g. Home"
                    className="w-full pl-10 pr-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">End Location <span className="normal-case font-normal">(optional)</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    placeholder="e.g. Office"
                    className="w-full pl-10 pr-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-500 hover:bg-forest-600 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-forest-500/10 transition-all disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Log This Commute</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview Sidebar */}
        <div className="bg-forest-900 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between h-fit lg:sticky lg:top-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-semibold text-emerald-300">Live Preview</h3>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Real-time estimate of this trip's carbon impact compared to solo driving.
            </p>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Projected Emissions</p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className={`text-4xl font-bold font-display transition-all ${projectedCo2 === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {projectedCo2}
                  </span>
                  <span className="text-slate-400 text-sm">kg CO₂</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">CO₂ Saved vs Car</p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-4xl font-bold font-display text-emerald-400">+{projectedSaved}</span>
                  <span className="text-slate-400 text-sm">kg saved</span>
                </div>
              </div>

              {isEcoMode && parseFloat(distanceKm) > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 leading-relaxed">
                  🌿 Zero-emission travel! You're making the best possible choice for the planet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>Based on standard IPCC emission factors. Walk and Bicycle produce zero operational CO₂.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogTrip;
