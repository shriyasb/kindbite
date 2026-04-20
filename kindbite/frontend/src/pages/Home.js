import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const stats = [
  { label: 'Meals Saved', value: '1,20,000+', icon: '🍽️' },
  { label: 'Active Donors', value: '3,400+', icon: '🏠' },
  { label: 'NGO Partners', value: '280+', icon: '🤝' },
  { label: 'Cities Covered', value: '42', icon: '🌆' },
];

const steps = [
  { step: '1', title: 'Donor Posts Food', desc: 'Restaurants, homes, events upload surplus food with location and expiry.', icon: '📦' },
  { step: '2', title: 'NGO Gets Notified', desc: 'Nearby NGOs receive real-time alerts and see the food on the map.', icon: '🔔' },
  { step: '3', title: 'Pickup & Deliver', desc: 'Volunteer picks up and marks delivery. Meals saved, waste eliminated.', icon: '🚗' },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span>🌱</span> Fighting food waste, one meal at a time
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Every meal matters.<br />
            <span className="text-brand-500">Don't let it waste.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            KindBite connects food donors with NGOs and volunteers in real time — ensuring surplus food reaches those who need it before it expires.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <Link to={`/${user.role}`} className="btn-primary px-8 py-3 text-base">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-3 text-base">Join as Donor</Link>
                <Link to="/register" className="btn-success px-8 py-3 text-base">Join as NGO</Link>
                <Link to="/login" className="btn-secondary px-8 py-3 text-base">Log In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="card text-center hover:shadow-md transition">
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-brand-600 font-display">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-12">How KindBite Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="card text-center hover:shadow-lg transition-all group">
                <div className="text-5xl mb-4">{s.icon}</div>
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-500 text-white text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Ready to make a difference?</h2>
        <p className="mb-8 text-orange-100">Join thousands of donors and NGOs already using KindBite.</p>
        <Link to="/register" className="bg-white text-brand-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition">
          Create Free Account
        </Link>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-sm text-center py-6">
        © {new Date().getFullYear()} KindBite — Built with ❤️ to eliminate food waste
      </footer>
    </div>
  );
}
