import React, { createContext, useContext, useState } from 'react';
import { MOCK_USER_DONOR, MOCK_USER_NGO, MOCK_USER_ADMIN } from '../utils/mockData';

const AuthContext = createContext();

const DEMO_ACCOUNTS = {
  'donor@demo.com':  { password: 'demo123', user: MOCK_USER_DONOR },
  'ngo@demo.com':    { password: 'demo123', user: MOCK_USER_NGO },
  'admin@demo.com':  { password: 'demo123', user: MOCK_USER_ADMIN },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kb_user')); } catch { return null; }
  });
  const [loading] = useState(false);

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

  const demoLogin = (email, password) => {
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account) return { success: false, message: 'Use: donor@demo.com / ngo@demo.com / admin@demo.com' };
    if (account.password !== password) return { success: false, message: 'Password: demo123' };
    login('demo_token', account.user);
    return { success: true, user: account.user };
  };

  const refreshUser = () => {};

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, demoLogin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
