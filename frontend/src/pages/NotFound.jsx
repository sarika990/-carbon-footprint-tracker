import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center bg-warm-50 text-slate-800 animate-slide-up">
      <div className="w-16 h-16 bg-forest-50 text-forest-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <Leaf className="w-8 h-8 fill-current" />
      </div>
      <h1 className="text-4xl font-bold font-display text-slate-900 mb-2">404</h1>
      <p className="text-slate-500 text-sm max-w-sm mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
