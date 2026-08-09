import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LogTrip from './pages/LogTrip';
import History from './pages/History';
import Badges from './pages/Badges';
import NotFound from './pages/NotFound';

// Protected Route Wrapper
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-semibold mt-4 font-sans">Loading CarbonPath...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-warm-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Primary screen viewport */}
      <main className="flex-1 md:pl-64 h-full overflow-y-auto">
        <div className="h-full w-full">
          {children}
        </div>
      </main>

      {/* Mobile navigation tab bar */}
      <BottomNav />
    </div>
  );
};

// Public Route (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-semibold mt-4 font-sans">Loading CarbonPath...</p>
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              } 
            />

            <Route 
              path="/" 
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/log-trip" 
              element={
                <ProtectedLayout>
                  <LogTrip />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedLayout>
                  <History />
                </ProtectedLayout>
              } 
            />
            <Route 
              path="/badges" 
              element={
                <ProtectedLayout>
                  <Badges />
                </ProtectedLayout>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
