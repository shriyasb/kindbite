import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected, unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = path => location.pathname === path;

  const navLinks = user?.role === 'donor'
    ? [{ to: '/donor', label: 'Dashboard' }, { to: '/post-food', label: 'Donate Food' }, { to: '/map', label: 'Map' }, { to: '/history', label: 'History' }]
    : user?.role === 'ngo'
    ? [{ to: '/ngo', label: 'Dashboard' }, { to: '/map', label: 'Map' }, { to: '/history', label: 'History' }]
    : user?.role === 'admin'
    ? [{ to: '/admin', label: 'Dashboard' }]
    : [];

  return (
    <nav className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍱</span>
          <span className="font-display text-xl font-bold text-brand-600">KindBite</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive(l.to) ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {connected && user.role !== 'admin' && (
                <span className="w-2 h-2 rounded-full bg-green-400" title="Connected" />
              )}
              {unreadCount > 0 && (
                <span className="bg-brand-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
              )}
              <span className="text-sm text-gray-600">
                Hi, <strong>{user.name?.split(' ')[0]}</strong>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'ngo' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {user.role.toUpperCase()}
              </span>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-3">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Get Started</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 flex flex-col gap-1" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-5 h-0.5 bg-gray-600" />
          <div className="w-5 h-0.5 bg-gray-600" />
          <div className="w-5 h-0.5 bg-gray-600" />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-red-600">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-brand-600">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-brand-600">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
