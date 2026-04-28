import React, { useState } from 'react';
import { MOCK_ADMIN_STATS, MOCK_USERS_LIST, MOCK_FOOD_POSTS } from '../utils/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#16a34a', '#3b82f6', '#eab308'];

export default function AdminDashboard() {
  const stats = MOCK_ADMIN_STATS;
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState(MOCK_USERS_LIST);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.organization?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
    toast.success('User status updated');
  };

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">KindBite platform overview</p>

        {/* Mega stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Meals Saved', value: stats.totalMealsSaved.toLocaleString(), icon: '🍽️', color: 'text-brand-600' },
            { label: 'Total Donations', value: stats.posts.total, icon: '📦', color: 'text-blue-600' },
            { label: 'Active Users', value: stats.users.total, icon: '👥', color: 'text-green-600' },
            { label: 'Delivered', value: stats.posts.delivered, icon: '✅', color: 'text-purple-600' },
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
            {/* Bar chart */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Donations (Last 14 Days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.donationsByDay}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Posts by Food Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.mealsByType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                    {stats.mealsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top donors */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">🏆 Top Donors</h3>
              <div className="space-y-3">
                {stats.topDonors.map((d, i) => (
                  <div key={d._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                      <div>
                        <div className="font-medium text-sm">{d.name || d.organization}</div>
                        <div className="text-xs text-gray-400">{d.totalDonations} donations · ⭐ {d.rating}</div>
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
                {stats.topNGOs.map((n, i) => (
                  <div key={n._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                      <div>
                        <div className="font-medium text-sm">{n.organization || n.name}</div>
                        <div className="text-xs text-gray-400">{n.totalPickups} pickups · ⭐ {n.rating}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">{n.totalMealsSaved} meals</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status summary */}
            <div className="card md:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-4">Platform Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Active Posts', value: stats.posts.active, color: 'bg-green-50 text-green-700' },
                  { label: 'Delivered', value: stats.posts.delivered, color: 'bg-purple-50 text-purple-700' },
                  { label: 'Expired', value: stats.posts.expired, color: 'bg-gray-50 text-gray-500' },
                  { label: 'Donors', value: stats.users.donors, color: 'bg-orange-50 text-orange-700' },
                  { label: 'NGOs', value: stats.users.ngos, color: 'bg-blue-50 text-blue-700' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                    <div className="text-2xl font-bold font-display">{s.value}</div>
                    <div className="text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="card">
            <input className="input mb-5" placeholder="Search users…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  {filtered.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 font-medium">{u.name || u.organization || '—'}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{u.email}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ngo' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{u.role}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-brand-600 font-semibold">{u.totalMealsSaved}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <button onClick={() => toggleUser(u._id)} className="text-xs text-gray-500 hover:text-red-500 transition">
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

        {tab === 'posts' && (
          <div className="card space-y-3">
            {MOCK_FOOD_POSTS.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex gap-3 items-center">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                  <div>
                    <div className="font-medium text-sm">{p.title}</div>
                    <div className="text-xs text-gray-400">{p.donor?.name} · {p.quantity} servings · {p.address?.slice(0, 40)}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-3 flex-shrink-0 ${p.status === 'delivered' ? 'bg-purple-100 text-purple-700' : p.status === 'available' ? 'bg-green-100 text-green-700' : p.status === 'expired' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
