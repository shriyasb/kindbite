import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostFood from './pages/PostFood';
import MapView from './pages/MapView';
import History from './pages/History';
import Navbar from './components/common/Navbar';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}`} />} />

        <Route path="/donor" element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>} />
        <Route path="/ngo" element={<ProtectedRoute roles={['ngo']}><NGODashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/post-food" element={<ProtectedRoute roles={['donor']}><PostFood /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ className: 'font-body text-sm' }} />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
