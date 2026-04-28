import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_FOOD_POSTS, MOCK_REQUESTS } from '../utils/mockData';
import { formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

function ExpiryCountdown({ expiryTime }) {
  const diff = new Date(expiryTime) - new Date();
  if (diff <= 0) return <span className="text-xs font-mono font-bold text-red-500">⏱ Expired</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const label = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return <span className={`text-xs font-mono font-bold ${h < 1 ? 'text-orange-500' : 'text-green-600'}`}>⏱ {label}</span>;
}

export default function NGODashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('available');
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const availablePosts = MOCK_FOOD_POSTS.filter(p => p.status === 'available');

  const acceptPost = (post) => {
    toast.success(`Accepted! Head to: ${post.address}`);
  };

  const updateStatus = (requestId, action) => {
    setRequests(prev => prev.map(r =>
      r._id === requestId ? { ...r, status: action === 'pickup' ? 'picked_up' : 'delivered' } : r
    ));
    toast.success(action === 'pickup' ? 'Marked as picked up!' : 'Delivery confirmed! Great work 🎉');
  };

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">NGO Dashboard</h1>
            <p className="text-gray-500">Welcome, {user?.organization || user?.name} 👋</p>
          </div>
          {requests.some(r => ['accepted', 'picked_up'].includes(r.status)) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700 font-medium">
              🚗 Active pickup in progress
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Pickups', value: user?.totalPickups || 0, icon: '📦' },
            { label: 'Meals Delivered', value: user?.totalMealsSaved || 0, icon: '🍽️' },
            { label: 'Rating', value: `${user?.rating?.toFixed(1)} ⭐`, icon: '⭐' },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-brand-600 font-display">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[{ id: 'available', label: '🍱 Available Food' }, { id: 'my-requests', label: '📋 My Pickups' }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {t.label}
              {t.id === 'available' && <span className="ml-1.5 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{availablePosts.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'available' && (
          <div className="space-y-4">
            {availablePosts.map((post) => (
              <div key={post._id} className={`card hover:shadow-md transition ${post.isUrgent ? 'border-l-4 border-red-400' : ''}`}>
                <div className="flex gap-4">
                  {post.images?.[0]
                    ? <img src={post.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center text-3xl flex-shrink-0">🍱</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      {post.isUrgent && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">🚨 Urgent</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.foodType === 'veg' ? 'bg-green-100 text-green-700' : post.foodType === 'non-veg' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {post.foodType}
                      </span>
                      <span>👥 {post.quantity} servings</span>
                      <span>👤 {post.donor?.name}</span>
                      {post.donor?.rating > 0 && <span>⭐ {post.donor.rating.toFixed(1)}</span>}
                    </div>
                    <div className="text-xs text-gray-400 mb-3">📍 {post.address}</div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <ExpiryCountdown expiryTime={post.expiryTime} />
                      <button onClick={() => acceptPost(post)} className="btn-success text-sm py-1.5 px-4">
                        Accept & Pickup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'my-requests' && (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="card">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold">{req.foodPost?.title}</h3>
                    <div className="text-sm text-gray-500 mt-1">📍 {req.foodPost?.address}</div>
                    <div className="text-sm text-gray-500">👤 Donor: {req.donor?.name} {req.donor?.phone && `· 📞 ${req.donor.phone}`}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${req.status === 'delivered' ? 'bg-purple-100 text-purple-700' : req.status === 'picked_up' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {req.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {req.status === 'accepted' && (
                      <button onClick={() => updateStatus(req._id, 'pickup')} className="btn-primary text-sm py-1.5 px-3">
                        Mark Picked Up
                      </button>
                    )}
                    {req.status === 'picked_up' && (
                      <button onClick={() => updateStatus(req._id, 'deliver')} className="btn-success text-sm py-1.5 px-3">
                        Mark Delivered ✓
                      </button>
                    )}
                    {req.status === 'delivered' && (
                      <span className="text-xs text-green-600 font-medium">🍽️ {req.peopleServed} meals saved</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
