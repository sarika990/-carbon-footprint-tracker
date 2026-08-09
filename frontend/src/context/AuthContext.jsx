import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/user/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed. Please check your credentials.',
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Signup failed. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserStats = (streakStats) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        streakCount: streakStats.current,
        longestStreak: streakStats.longest,
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserStats, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
