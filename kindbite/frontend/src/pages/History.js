import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" disabled={readonly}
          onClick={() => !readonly && onChange?.(s)}
          className={`text-xl transition ${s <= value ? 'text-yellow-400' : 'text-gray-200'} ${!readonly ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

const statusColor = {
  accepted: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-500',
};

export default function History() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/requests/my', { params: { limit: 50 } });
      setRequests(data.requests);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const submitRating = async () => {
    if (!ratingModal) return;
    setSubmittingRating(true);
    try {
      await api.post('/ratings', {
        rateeId: ratingModal.rateeId,
        postId: ratingModal.postId,
        score: ratingScore,
        comment: ratingComment,
        type: ratingModal.type,
      });
      toast.success('Rating submitted. Thank you!');
      setRatingModal(null);
      setRatingScore(5);
      setRatingComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally { setSubmittingRating(false); }
  };

  const delivered = requests.filter(r => r.status === 'delivered');
  const totalMeals = delivered.reduce((sum, r) => sum + (r.peopleServed || 0), 0);

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">History</h1>
        <p className="text-gray-500 mb-8">Your complete donation and pickup history</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Activities', value: requests.length, icon: '📋' },
            { label: 'Completed', value: delivered.length, icon: '✅' },
            { label: 'Meals Impact', value: totalMeals, icon: '🍽️' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-brand-600 font-display">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-500 border-t-transparent" /></div>
        ) : requests.length === 0 ? (
          <div className="card text-center py-16 text-gray-500">No history yet.</div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="card hover:shadow-md transition">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{req.foodPost?.title || 'Food Donation'}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[req.status]}`}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-0.5">
                      {user?.role === 'ngo' && req.donor && (
                        <p>Donor: <span className="font-medium">{req.donor.name || req.donor.organization}</span>
                          {req.donor.phone && <span className="ml-2">{req.donor.phone}</span>}
                        </p>
                      )}
                      {user?.role === 'donor' && req.ngo && (
                        <p>Picked up by: <span className="font-medium">{req.ngo.name || req.ngo.organization}</span>
                          {req.ngo.phone && <span className="ml-2">{req.ngo.phone}</span>}
                        </p>
                      )}
                      {req.foodPost?.address && <p>{req.foodPost.address}</p>}
                      {req.status === 'delivered' && req.peopleServed > 0 && (
                        <p className="text-green-600 font-medium">{req.peopleServed} meals saved</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {req.createdAt && format(new Date(req.createdAt), 'dd MMM yyyy, hh:mm a')}
                      {req.deliveredAt && <span className="ml-3">Delivered: {format(new Date(req.deliveredAt), 'dd MMM yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {req.foodPost?.images?.[0] && (
                      <img src={req.foodPost.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    )}
                    {req.status === 'delivered' && user?.role === 'ngo' && req.donor && (
                      <button onClick={() => setRatingModal({ requestId: req._id, rateeId: req.donor._id, postId: req.foodPost?._id, type: 'donor_rating' })}
                        className="text-xs text-brand-600 hover:underline font-medium">
                        Rate Donor
                      </button>
                    )}
                    {req.status === 'delivered' && user?.role === 'donor' && req.ngo && (
                      <button onClick={() => setRatingModal({ requestId: req._id, rateeId: req.ngo._id, postId: req.foodPost?._id, type: 'ngo_rating' })}
                        className="text-xs text-brand-600 hover:underline font-medium">
                        Rate NGO
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-display text-xl font-bold mb-4">
              Rate {ratingModal.type === 'donor_rating' ? 'Donor' : 'NGO / Volunteer'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your rating:</p>
              <StarRating value={ratingScore} onChange={setRatingScore} />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea rows={3} className="input" placeholder="Share your experience..."
                value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRatingModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitRating} disabled={submittingRating} className="btn-primary flex-1">
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
