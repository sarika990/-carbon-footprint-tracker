import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Leaf, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';

const Landing = () => {
  const { login, signup, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        showToast('Welcome back!', 'success', 'Logged in successfully.');
        navigate('/');
      } else {
        setError(res.error);
        showToast('Login failed', 'error', res.error);
      }
    } else {
      if (!name) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      const res = await signup(name, email, password);
      if (res.success) {
        showToast('Welcome to CarbonPath!', 'success', 'Account created successfully.');
        navigate('/');
      } else {
        setError(res.error);
        showToast('Signup failed', 'error', res.error);
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const res = await login('demo@carbon.com', 'Password123');
    if (res.success) {
      showToast('Welcome back to Demo!', 'success', 'Logged in to demo account.');
      navigate('/');
    } else {
      setError(res.error);
      showToast('Demo login failed', 'error', res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-full flex flex-col md:flex-row bg-warm-50">
      {/* Left panel: custom graphic banner (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-forest-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-forest-400 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-emerald-300 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Leaf className="w-4 h-4 text-emerald-400 fill-current" />
          </div>
          <span className="font-display font-bold tracking-wider text-sm text-emerald-400">CARBONPATH</span>
        </div>

        <div className="relative z-10 my-auto max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-6">
            Track your footprint. <br />
            <span className="text-emerald-400">Commute greener.</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Log your daily trips, discover lower-emission alternatives, build eco-streaks, and unlock achievements for a healthier planet.
          </p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold font-display text-emerald-400">0 kg</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">CO₂ Target</p>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div>
              <p className="text-2xl font-bold font-display text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Eco-Friendly Alternatives</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex justify-between">
          <span>© 2026 CarbonPath.</span>
          <span className="hover:underline cursor-pointer">Help & Terms</span>
        </div>
      </div>

      {/* Right panel: authentication form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:w-1/2">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="text-center md:text-left">
            <div className="inline-flex md:hidden items-center justify-center w-12 h-12 rounded-xl bg-forest-500 text-white mb-4 shadow-md">
              <Leaf className="w-6 h-6 fill-current" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 font-display">
              {isLogin ? 'Welcome back' : 'Join the mission'}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {isLogin
                ? "Sign in to log today's commutes and track your streaks."
                : 'Create an account to start tracking and earning rewards.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-500 hover:bg-forest-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-forest-500/10 hover:shadow-forest-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-warm-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wide">Or Demo</span>
            <div className="flex-grow border-t border-warm-200"></div>
          </div>

          <div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-warm-100 hover:bg-warm-200 text-slate-700 font-semibold py-3 rounded-xl border border-warm-200 flex items-center justify-center gap-2 transition-all"
            >
              ⚡ Fast Demo Login (demo@carbon.com)
            </button>
          </div>

          <p className="text-center text-sm text-slate-500">
            {isLogin ? 'New to CarbonPath?' : 'Already have an account?'} &nbsp;
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-semibold text-forest-600 hover:text-forest-700 hover:underline focus:outline-none"
            >
              {isLogin ? 'Create one now' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
