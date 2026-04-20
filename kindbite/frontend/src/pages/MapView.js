import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const urgentIcon = new L.DivIcon({
  html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(239,68,68,0.8)"></div>',
  iconSize: [14, 14], iconAnchor: [7, 7],
});

const normalIcon = new L.DivIcon({
  html: '<div style="background:#f97316;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [12, 12], iconAnchor: [6, 6],
});

const userIcon = new L.DivIcon({
  html: '<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(59,130,246,0.6)"></div>',
  iconSize: [14, 14], iconAnchor: [7, 7],
});

export default function MapView() {
  const [posts, setPosts] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India default

  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = [p.coords.latitude, p.coords.longitude];
        setUserPos(pos);
        setCenter(pos);
      },
      () => toast('Could not detect location, showing all posts', { icon: 'ℹ️' })
    );
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/food-posts/map');
      setPosts(data.posts);
    } catch { toast.error('Failed to load map data'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Food Map</h1>
            <p className="text-gray-500 text-sm mt-0.5">{posts.length} active donation{posts.length !== 1 ? 's' : ''} near you</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Urgent</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-500 inline-block" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> You</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Map */}
          <div className="md:col-span-2 h-[520px] rounded-2xl overflow-hidden shadow-md">
            {loading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent" />
              </div>
            ) : (
              <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />
                {userPos && (
                  <>
                    <Marker position={userPos} icon={userIcon}>
                      <Popup><strong>Your Location</strong></Popup>
                    </Marker>
                    <Circle center={userPos} radius={5000} pathOptions={{ color: '#3b82f6', fillOpacity: 0.05, weight: 1 }} />
                  </>
                )}
                {posts.map((post) => {
                  const [lng, lat] = post.location.coordinates;
                  return (
                    <Marker
                      key={post._id}
                      position={[lat, lng]}
                      icon={post.isUrgent ? urgentIcon : normalIcon}
                      eventHandlers={{ click: () => setSelected(post) }}
                    >
                      <Popup>
                        <div className="text-sm min-w-[160px]">
                          <strong>{post.title}</strong><br />
                          <span className="text-gray-500">{post.donor?.name || post.donor?.organization}</span><br />
                          <span>👥 {post.quantity} servings</span><br />
                          <span className="text-xs text-gray-400">⏱ Expires {formatDistanceToNow(new Date(post.expiryTime), { addSuffix: true })}</span>
                          {post.isUrgent && <div className="text-red-500 text-xs font-bold mt-1">🚨 URGENT</div>}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>

          {/* Sidebar list */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {posts.length === 0 ? (
              <div className="card text-center text-gray-500 py-10">No active posts nearby</div>
            ) : posts.map((post) => (
              <div
                key={post._id}
                onClick={() => setSelected(post)}
                className={`card cursor-pointer transition hover:shadow-md ${selected?._id === post._id ? 'ring-2 ring-brand-400' : ''} ${post.isUrgent ? 'border-l-4 border-red-400' : ''}`}
              >
                <div className="flex gap-3">
                  {post.images?.[0]
                    ? <img src={post.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">🍱</div>
                  }
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.donor?.name || post.donor?.organization}</div>
                    <div className="text-xs text-gray-400 mt-0.5">👥 {post.quantity} · ⏱ {formatDistanceToNow(new Date(post.expiryTime), { addSuffix: true })}</div>
                    <div className="text-xs text-gray-400 truncate">📍 {post.address}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected post detail card */}
        {selected && (
          <div className="card mt-5">
            <div className="flex justify-between items-start">
              <h3 className="font-display text-xl font-bold">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-2 text-sm text-gray-600">
                <p>👤 <strong>Donor:</strong> {selected.donor?.name || selected.donor?.organization}</p>
                <p>🍽️ <strong>Type:</strong> {selected.foodType}</p>
                <p>👥 <strong>Quantity:</strong> {selected.quantity} servings</p>
                <p>📍 <strong>Address:</strong> {selected.address}</p>
                <p>⏱ <strong>Expires:</strong> {formatDistanceToNow(new Date(selected.expiryTime), { addSuffix: true })}</p>
              </div>
              <div className="flex gap-2">
                {(selected.images || []).slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-24 h-24 rounded-xl object-cover" />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <a
                href={`https://www.openstreetmap.org/directions?to=${selected.location.coordinates[1]},${selected.location.coordinates[0]}`}
                target="_blank" rel="noreferrer"
                className="btn-primary text-sm inline-block"
              >
                🗺️ Get Directions
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
