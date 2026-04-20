const mongoose = require('mongoose');

// ─── Request ──────────────────────────────────────────────────────────────────
const requestSchema = new mongoose.Schema(
  {
    foodPost: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodPost', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'],
      default: 'pending',
    },
    note: { type: String, trim: true },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    peopleServed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Rating ───────────────────────────────────────────────────────────────────
const ratingSchema = new mongoose.Schema(
  {
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodPost: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodPost', required: true },
    score: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    type: { type: String, enum: ['donor_rating', 'ngo_rating'], required: true },
  },
  { timestamps: true }
);

ratingSchema.index({ rater: 1, foodPost: 1 }, { unique: true });

// ─── Notification ─────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: [
        'new_food_post',
        'request_accepted',
        'food_picked_up',
        'food_delivered',
        'new_rating',
        'post_expired',
        'request_cancelled',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Request: mongoose.model('Request', requestSchema),
  Rating: mongoose.model('Rating', ratingSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
