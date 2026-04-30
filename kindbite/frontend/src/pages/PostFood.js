import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function PostFood() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    title: '', foodType: 'veg', description: '', quantity: '',
    quantityUnit: 'servings', cookedAt: '', expiryTime: '',
    address: '', lat: '', lng: '', isUrgent: false,
  });

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(p => ({ ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
        setLocating(false);
        toast.success('Location detected!');
      },
      () => { toast.error('Could not detect location'); setLocating(false); }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.lat || !form.lng) return toast.error('Please provide pickup location coordinates');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      await api.post('/food-posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Food donation posted! NGOs have been notified.');
      navigate('/donor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post donation');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Post Food Donation</h1>
          <p className="text-gray-500 mt-1">Share surplus food with those in need.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required className="input" placeholder="e.g. Leftover biryani from wedding event" value={form.title} onChange={set('title')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
              <select required className="input" value={form.foodType} onChange={set('foodType')}>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (servings)</label>
              <input required type="number" min="1" className="input" placeholder="e.g. 50" value={form.quantity} onChange={set('quantity')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="input" placeholder="Describe the food, ingredients, packaging..." value={form.description} onChange={set('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cooked At</label>
              <input required type="datetime-local" className="input" value={form.cookedAt} onChange={set('cookedAt')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Time</label>
              <input required type="datetime-local" className="input" value={form.expiryTime} onChange={set('expiryTime')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
            <input required className="input mb-2" placeholder="Full pickup address" value={form.address} onChange={set('address')} />
            <div className="flex gap-2">
              <input className="input" placeholder="Latitude" value={form.lat} onChange={set('lat')} />
              <input className="input" placeholder="Longitude" value={form.lng} onChange={set('lng')} />
              <button type="button" onClick={detectLocation} disabled={locating} className="btn-secondary text-sm px-3 whitespace-nowrap">
                {locating ? 'Detecting...' : 'Detect Location'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photos (max 5)</label>
            <input
              type="file" accept="image/*" multiple
              onChange={e => setImages(Array.from(e.target.files).slice(0, 5))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:font-medium hover:file:bg-brand-100 cursor-pointer"
            />
            {images.length > 0 && <p className="text-xs text-gray-500 mt-1">{images.length} file(s) selected</p>}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative w-10 h-5 rounded-full transition ${form.isUrgent ? 'bg-red-500' : 'bg-gray-200'}`}
              onClick={() => setForm({ ...form, isUrgent: !form.isUrgent })}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isUrgent ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Mark as Urgent (expiring soon)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/donor')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Posting...' : 'Post Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
