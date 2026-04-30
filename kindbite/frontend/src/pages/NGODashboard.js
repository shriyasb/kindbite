import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

function ExpiryCountdown({ expiryTime }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiryTime) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiryTime]);
  const expired = isPast(new Date(expiryTime));
  return <span className={`text-xs font-mono font-bold ${expired ? 'text-red-500' : parseInt(timeLeft) < 60 ? 'text-orange-500' : 'text-green-600'}`}>⏱ {timeLeft}</span>;
}

export default function NGODashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');
  const [filters, setFilters] = useState({ maxDistance: 20000, foodType: '', minQty: '' });
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState({ lat: '', lng: '' });

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
      () => { toast.error('Location denied'); setLocating(false); }
    );
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (userCoords.lat) { params.lat = userCoords.lat; params.lng = userCoords.lng; }
      const { data } = await api.get('/food-posts', { params });
      setPosts(data.posts);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, [filters, userCoords]);

  const fetchMyRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/requests/my');
      setMyRequests(data.requests);
    } catch { }
  }, []);

  useEffect(() => {
    if (tab === 'available') fetchPosts();
    else fetchMyRequests();
  }, [tab, fetchPosts, fetchMyRequests]);

  const acceptPost = async (postId) => {
    try {
      await api.post(`/requests/${postId}/accept`);
      toast.success('Request accepted! Head to the pickup location.');
      fetchPosts();
      setTab('my-requests');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to accept'); }
  };

  const updateStatus = async (requestId, action) => {
    try {
      const endpoint = action === 'pickup' ? 'pickup' : 'deliver';
      await api.put(`/requests/${requestId}/${endpoint}`);
      toast.success(action === 'pickup' ? 'Marked as picked up!' : 'Delivery confirmed! Great work 🎉');
      fetchMyRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const activeRequest = myRequests.find(r => ['accepted', 'picked_up'].includes(r.status));

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">NGO Dashboard</h1>
            <p className="text-gray-500">Welcome, {user?.name || user?.organization} 👋</p>
          </div>
          {activeRequest && (
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
            { label: 'Rating', value: user?.rating ? `${user.rating.toFixed(1)} ⭐` : 'N/A', icon: '⭐' },
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
            </button>
          ))}
        </div>

        {tab === 'available' && (
          <>
            {/* Filters */}
            <div className="card mb-5 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Distance</label>
                <select className="input text-sm py-1.5" value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}>
                  <option value="5000">5 km</option>
                  <option value="10000">10 km</option>
                  <option value="20000">20 km</option>
                  <option value="50000">50 km</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Food Type</label>
                <select className="input text-sm py-1.5" value={filters.foodType}
                  onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}>
                  <option value="">All</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="vegan">Vegan</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min Qty</label>
                <input type="number" min="1" placeholder="Any" className="input text-sm py-1.5 w-20"
                  value={filters.minQty} onChange={(e) => setFilters({ ...filters, minQty: e.target.value })} />
              </div>
              <button onClick={getLocation} disabled={locating} className="btn-secondary text-sm py-1.5">
                {locating ? '…' : '📍 Use My Location'}
              </button>
              <button onClick={fetchPosts} className="btn-primary text-sm py-1.5">Search</button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent" /></div>
            ) : posts.length === 0 ? (
              <div className="card text-center py-16 text-gray-500">No food posts nearby. Try expanding the distance filter.</div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className={`card hover:shadow-md transition ${post.isUrgent ? 'border-l-4 border-red-400' : ''}`}>
                    <div className="flex gap-4">
                      {post.images?.[0] && <img src={post.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          {post.isUrgent && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">🚨 Urgent</span>}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                          <span className={`badge-${post.foodType === 'non-veg' ? 'nonveg' : post.foodType}`}>
                            {post.foodType}
                          </span>
                          <span>👥 {post.quantity} servings</span>
                          <span>👤 By: {post.donor?.name || post.donor?.organization}</span>
                          {post.donor?.rating > 0 && <span>⭐ {post.donor.rating.toFixed(1)}</span>}
                        </div>
                        <div className="text-xs text-gray-400 mb-3">📍 {post.address}</div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <ExpiryCountdown expiryTime={post.expiryTime} />
                          <button onClick={() => acceptPost(post._id)} className="btn-success text-sm py-1.5 px-4">
                            Accept & Pickup
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'my-requests' && (
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="card text-center py-16 text-gray-500">No pickups yet.</div>
            ) : myRequests.map((req) => (
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
