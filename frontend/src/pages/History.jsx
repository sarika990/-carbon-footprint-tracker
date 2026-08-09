import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/LoadingSkeleton';
import { Trash2, ShieldAlert, X, ArrowLeftRight, AlertCircle } from 'lucide-react';

const TRANSPORT_EMOJIS = {
  'Car': '🚗',
  'Bike/Motorcycle': '🏍️',
  'Bus': '🚌',
  'Train/Metro': '🚇',
  'Carpool': '👥',
  'Bicycle': '🚲',
  'Walk': '🚶',
};

const History = () => {
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [mode, setMode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = {};
      if (mode) params.mode = mode;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/trips', { params });
      setTrips(res.data);
    } catch (err) {
      console.error(err);
      setFetchError(true);
      showToast('Error loading history', 'error', 'Could not retrieve your trip history.');
    } finally {
      setLoading(false);
    }
  }, [mode, startDate, endDate]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip entry permanently?')) {
      try {
        await api.delete(`/trips/${id}`);
        showToast('Trip deleted', 'success', 'The commute entry has been removed.');
        fetchTrips();
      } catch (err) {
        console.error(err);
        showToast('Failed to delete trip', 'error');
      }
    }
  };

  const handleClearFilters = () => {
    setMode('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = mode || startDate || endDate;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 pb-20 md:pb-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 font-display">Trip History</h1>
        <p className="text-sm text-slate-500 mt-1">Review, filter, and manage all your logged commutes.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transport Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
            >
              <option value="">All Modes</option>
              <option value="Car">🚗 Car</option>
              <option value="Bike/Motorcycle">🏍️ Bike/Motorcycle</option>
              <option value="Bus">🚌 Bus</option>
              <option value="Train/Metro">🚇 Train/Metro</option>
              <option value="Carpool">👥 Carpool</option>
              <option value="Bicycle">🚲 Bicycle</option>
              <option value="Walk">🚶 Walk</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-warm-200 hover:bg-warm-100 rounded-xl text-sm font-medium text-slate-600 transition-all whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Filters active — showing filtered results
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <ListSkeleton />
      ) : fetchError ? (
        <div className="bg-white border border-warm-200 rounded-2xl p-12 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Failed to load trips. Please try again.</p>
          <button onClick={fetchTrips} className="mt-4 px-4 py-2 bg-forest-500 text-white rounded-xl text-sm font-semibold">Retry</button>
        </div>
      ) : trips.length > 0 ? (
        <div className="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-slate-700">
              <thead>
                <tr className="bg-warm-50 text-xs font-semibold uppercase text-slate-400 border-b border-warm-200">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Mode</th>
                  <th className="py-4 px-6">Distance</th>
                  <th className="py-4 px-6">Route</th>
                  <th className="py-4 px-6 text-right">CO₂ (kg)</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-sm">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-warm-50/60 transition-colors group">
                    <td className="py-3.5 px-6 font-medium text-slate-800 whitespace-nowrap">{trip.date}</td>
                    <td className="py-3.5 px-6">
                      <span className="flex items-center gap-2">
                        <span>{TRANSPORT_EMOJIS[trip.mode] || '🚌'}</span>
                        <span className="font-medium">{trip.mode}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{trip.distanceKm} km</td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {trip.startLocation && trip.endLocation ? (
                        <span className="flex items-center gap-1.5 max-w-[200px]">
                          <span className="truncate">{trip.startLocation}</span>
                          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          <span className="truncate">{trip.endLocation}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className={`py-3.5 px-6 text-right font-bold font-display ${trip.co2Emitted > 1 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {trip.co2Emitted}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => handleDelete(trip.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-warm-100">
            {trips.map((trip) => (
              <div key={trip.id} className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-warm-50 border border-warm-100 flex items-center justify-center text-base flex-shrink-0">
                    {TRANSPORT_EMOJIS[trip.mode] || '🚌'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{trip.mode}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{trip.date} · {trip.distanceKm} km</p>
                    {trip.startLocation && trip.endLocation && (
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{trip.startLocation} → {trip.endLocation}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm font-bold font-display ${trip.co2Emitted > 1 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {trip.co2Emitted} kg
                  </span>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-warm-200 rounded-2xl p-12 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No Commutes Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {hasActiveFilters ? 'No trips match your current filter criteria.' : 'You haven\'t logged any trips yet.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-warm-100 hover:bg-warm-200 text-slate-600 font-medium rounded-xl text-xs transition-all border border-warm-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
