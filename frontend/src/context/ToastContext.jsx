import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Trophy, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', description = '') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, description }]);
    
    // Auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === 'badge' ? 6000 : 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-slide-up ${
              t.type === 'badge'
                ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-900'
                : t.type === 'success'
                ? 'bg-white border-emerald-100 text-slate-800'
                : t.type === 'error'
                ? 'bg-white border-red-100 text-slate-800'
                : 'bg-white border-slate-100 text-slate-800'
            }`}
          >
            {/* Icon status indicator */}
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'badge' && <Trophy className="w-5 h-5 text-amber-600 animate-bounce" />}
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-slate-600" />}
            </div>

            {/* Details */}
            <div className="flex-grow">
              <h4 className="font-semibold text-sm">
                {t.type === 'badge' ? '🏆 Achievement Unlocked!' : t.message}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t.type === 'badge' ? `You earned the "${t.message}" badge!` : t.description || ''}
              </p>
            </div>

            {/* Dismiss trigger */}
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 rounded-lg p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;
