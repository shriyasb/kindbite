import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const statusColor = { available: 'bg-green-100 text-green-700', accepted: 'bg-blue-100 text-blue-700', picked_up: 'bg-yellow-100 text-yellow-700', delivered: 'bg-purple-100 text-purple-700', expired: 'bg-gray-100 text-gray-500', cancelled: 'bg-red-100 text-red-500' };

function FoodTypeTag({ type }) {
  const cls = { veg: 'badge-veg', 'non-veg': 'badge-nonveg', vegan: 'badge-vegan', mixed: 'badge-mixed' };
  const labels = { veg: '🟢 Veg', 'non-veg': '🔴 Non-Veg', vegan: '🌿 Vegan', mixed: '🟡 Mixed' };
  return <span className={cls[type] || 'badge-mixed'}>{labels[type]}</span>;
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchPosts = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get('/food-posts/my', { params });
      setPosts(data.posts);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const cancelPost = async (id) => {
    if (!window.confirm('Cancel this donation post?')) return;
    try {
      await api.delete(`/food-posts/${id}`);
      toast.success('Post cancelled');
      fetchPosts();
    } catch { toast.error('Failed to cancel'); }
  };

  const totalMeals = posts.filter(p => p.status === 'delivered').reduce((s, p) => s + (p.mealsSaved || p.quantity), 0);

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Donor Dashboard</h1>
            <p className="text-gray-500">Welcome, {user?.name} 👋</p>
          </div>
          <Link to="/post-food" className="btn-primary px-6">+ Donate Food</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Donations', value: user?.totalDonations || 0, icon: '📦', color: 'text-brand-600' },
            { label: 'Meals Saved', value: user?.totalMealsSaved || totalMeals, icon: '🍽️', color: 'text-green-600' },
            { label: 'Rating', value: user?.rating ? `${user.rating.toFixed(1)} ⭐` : 'N/A', icon: '⭐', color: 'text-yellow-600' },
            { label: 'Active Posts', value: posts.filter(p => p.status === 'available').length, icon: '✅', color: 'text-blue-600' },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className={`text-xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'available', 'accepted', 'picked_up', 'delivered', 'expired'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent" /></div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🍱</div>
            <p className="text-gray-500">No donations yet. Start by posting surplus food!</p>
            <Link to="/post-food" className="btn-primary mt-4 inline-block">Post Food Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="card hover:shadow-md transition">
                <div className="flex flex-wrap gap-3 items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      {post.isUrgent && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">🚨 Urgent</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                      <FoodTypeTag type={post.foodType} />
                      <span>👥 {post.quantity} servings</span>
                      <span>📍 {post.address?.slice(0, 40)}…</span>
                    </div>
                    {post.acceptedBy && (
                      <div className="text-sm text-blue-600 font-medium">
                        🤝 Accepted by: {post.acceptedBy.name || post.acceptedBy.organization}
                        {post.acceptedBy.phone && <span className="ml-2 text-gray-500">📞 {post.acceptedBy.phone}</span>}
                      </div>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>⏱ Expires: {isPast(new Date(post.expiryTime)) ? '❌ Expired' : formatDistanceToNow(new Date(post.expiryTime), { addSuffix: true })}</span>
                      <span>🕐 Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[post.status]}`}>
                      {post.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {post.images?.[0] && <img src={post.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                    {post.status === 'available' && (
                      <button onClick={() => cancelPost(post._id)} className="text-xs text-red-500 hover:underline">Cancel</button>
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
