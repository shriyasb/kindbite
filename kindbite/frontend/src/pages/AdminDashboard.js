import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#16a34a', '#3b82f6', '#eab308'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async (search = '') => {
    try {
      const { data } = await api.get('/admin/users', { params: { search, limit: 50 } });
      setUsers(data.users);
    } catch { }
  };

  const toggleUser = async (id, name) => {
    if (!window.confirm(`Toggle active status for ${name}?`)) return;
    try {
      await api.put(`/admin/users/${id}/toggle`);
      fetchUsers();
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">KindBite platform overview</p>

        {/* Mega stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Meals Saved', value: stats?.totalMealsSaved?.toLocaleString() || 0, icon: '🍽️', color: 'text-brand-600' },
            { label: 'Total Donations', value: stats?.posts?.total || 0, icon: '📦', color: 'text-blue-600' },
            { label: 'Active Users', value: stats?.users?.total || 0, icon: '👥', color: 'text-green-600' },
            { label: 'Delivered', value: stats?.posts?.delivered || 0, icon: '✅', color: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="card text-center hover:shadow-md transition">
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['overview', 'users', 'posts'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Donations by day */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Donations (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.donationsByDay || []}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By food type */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Posts by Food Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats?.mealsByType || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                    {(stats?.mealsByType || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Donors */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">🏆 Top Donors</h3>
              <div className="space-y-3">
                {(stats?.topDonors || []).map((d, i) => (
                  <div key={d._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                      <div>
                        <div className="font-medium text-sm">{d.name || d.organization}</div>
                        <div className="text-xs text-gray-400">{d.totalDonations} donations</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-brand-600">{d.totalMealsSaved} meals</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top NGOs */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">🏆 Top NGOs</h3>
              <div className="space-y-3">
                {(stats?.topNGOs || []).map((n, i) => (
                  <div key={n._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                      <div>
                        <div className="font-medium text-sm">{n.name || n.organization}</div>
                        <div className="text-xs text-gray-400">{n.totalPickups} pickups</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">{n.totalMealsSaved} meals</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post status summary */}
            <div className="card md:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-4">Post Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Active', value: stats?.posts?.active, color: 'bg-green-50 text-green-700' },
                  { label: 'Delivered', value: stats?.posts?.delivered, color: 'bg-purple-50 text-purple-700' },
                  { label: 'Expired', value: stats?.posts?.expired, color: 'bg-gray-50 text-gray-500' },
                  { label: 'Donors', value: stats?.users?.donors, color: 'bg-orange-50 text-orange-700' },
                  { label: 'NGOs', value: stats?.users?.ngos, color: 'bg-blue-50 text-blue-700' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                    <div className="text-2xl font-bold font-display">{s.value || 0}</div>
                    <div className="text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="card">
            <div className="flex gap-3 mb-5">
              <input className="input flex-1" placeholder="Search by name, email, org…"
                value={userSearch} onChange={(e) => { setUserSearch(e.target.value); fetchUsers(e.target.value); }} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Meals Saved</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 font-medium">{u.name || u.organization || '—'}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{u.email}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ngo' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{u.role}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-brand-600 font-semibold">{u.totalMealsSaved}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="py-2.5">
                        <button onClick={() => toggleUser(u._id, u.name)} className="text-xs text-gray-500 hover:text-red-500 transition">
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'posts' && <AdminPosts />}
      </div>
    </div>
  );
}

function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  useEffect(() => { fetchPosts(); }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/admin/posts', { params: { status: statusFilter, limit: 50 } });
      setPosts(data.posts);
    } catch { }
  };

  return (
    <div className="card">
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'available', 'accepted', 'delivered', 'expired', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
            <div>
              <div className="font-medium text-sm">{p.title}</div>
              <div className="text-xs text-gray-400">{p.donor?.name} · {p.quantity} servings · {p.address?.slice(0, 40)}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-3 flex-shrink-0 ${p.status === 'delivered' ? 'bg-purple-100 text-purple-700' : p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
