import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = demoLogin(form.email, form.password);
      if (result.success) {
        toast.success(`Welcome, ${result.user.name}!`);
        navigate(`/${result.user.role}`);
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }, 600);
  };

  const quickLogin = (email) => setForm({ email, password: 'demo123' });

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl">🍱</span>
          <h1 className="font-display text-2xl font-bold mt-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to your KindBite account</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide">🎓 Demo accounts — click to fill</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '🏠 Donor', email: 'donor@demo.com' },
              { label: '🤝 NGO', email: 'ngo@demo.com' },
              { label: '🔧 Admin', email: 'admin@demo.com' },
            ].map((a) => (
              <button key={a.email} type="button" onClick={() => quickLogin(a.email)}
                className="text-xs bg-white border border-orange-200 rounded-lg py-2 px-1 font-medium text-orange-700 hover:bg-orange-100 transition">
                {a.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Select a role above then click Log In · Password is demo123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="input" placeholder="donor@demo.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required className="input" placeholder="demo123"
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
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const handleQuick = (role) => {
    const result = demoLogin(`${role}@demo.com`, 'demo123');
    if (result.success) navigate(`/${role}`);
  };
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <span className="text-4xl">🍱</span>
        <h1 className="font-display text-2xl font-bold mt-2 mb-2">Join KindBite</h1>
        <p className="text-gray-500 text-sm mb-6">Pick your role to jump straight into the demo</p>
        <div className="space-y-3">
          <button onClick={() => handleQuick('donor')} className="btn-primary w-full py-3">
            <div>🏠 Continue as Donor</div>
            <div className="text-xs opacity-80 mt-0.5">Post surplus food donations</div>
          </button>
          <button onClick={() => handleQuick('ngo')} className="btn-success w-full py-3">
            <div>🤝 Continue as NGO / Volunteer</div>
            <div className="text-xs opacity-80 mt-0.5">Accept and distribute food</div>
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
