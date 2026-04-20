const mongoose = require('mongoose');

const foodPostSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'mixed'],
      required: true,
    },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true }, // number of people it can serve
    quantityUnit: { type: String, default: 'servings' },
    cookedAt: { type: Date, required: true },
    expiryTime: { type: Date, required: true },
    images: [{ type: String }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'accepted', 'picked_up', 'delivered', 'expired', 'cancelled'],
      default: 'available',
    },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    mealsSaved: { type: Number, default: 0 }, // same as quantity when delivered
    tags: [{ type: String }],
    isUrgent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

foodPostSchema.index({ location: '2dsphere' });
foodPostSchema.index({ status: 1, expiryTime: 1 });

module.exports = mongoose.model('FoodPost', foodPostSchema);
