import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { MOCK_USER_ADMIN } from '../utils/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kb_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('kb_token');
    if (!token) { setLoading(false); return; }
    // Admin is mock-only, no backend call needed
    const stored = JSON.parse(localStorage.getItem('kb_user') || 'null');
    if (stored?.role === 'admin') { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('kb_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('kb_token');
      localStorage.removeItem('kb_user');
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = (token, userData) => {
    localStorage.setItem('kb_token', token || 'demo_token');
    localStorage.setItem('kb_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kb_token');
    localStorage.removeItem('kb_user');
    setUser(null);
  };

  // Only admin uses demo login
  const adminLogin = (email, password) => {
    if (email === 'admin@demo.com' && password === 'demo123') {
      login('demo_token', MOCK_USER_ADMIN);
      return { success: true, user: MOCK_USER_ADMIN };
    }
    return { success: false, message: 'Invalid admin credentials' };
  };

  const refreshUser = () => fetchMe();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, adminLogin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
