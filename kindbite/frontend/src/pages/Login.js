import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(`/${data.user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🍱</span>
          <h1 className="font-display text-2xl font-bold mt-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to your KindBite account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="input" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required className="input" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          No account? <Link to="/register" className="text-brand-600 font-medium">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor', phone: '', organization: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      toast.success('Account created! Welcome to KindBite 🎉');
      navigate(`/${data.user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-4xl">🍱</span>
          <h1 className="font-display text-2xl font-bold mt-2">Join KindBite</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account and start making an impact</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            {['donor', 'ngo'].map((r) => (
              <button type="button" key={r}
                onClick={() => setForm({ ...form, role: r })}
                className={`p-3 rounded-xl border-2 text-sm font-semibold transition ${form.role === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {r === 'donor' ? '🏠 I\'m a Donor' : '🤝 I\'m an NGO/Volunteer'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required className="input" placeholder="Your name" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input" placeholder="+91 9999999999" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          {form.role === 'ngo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input className="input" placeholder="NGO / Organization name" value={form.organization} onChange={set('organization')} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required minLength={6} className="input" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input className="input" placeholder="Your city / area" value={form.address} onChange={set('address')} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
