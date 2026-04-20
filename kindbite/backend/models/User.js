const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    organization: { type: String, trim: true }, // For NGOs
    address: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalDonations: { type: Number, default: 0 },
    totalPickups: { type: Number, default: 0 },
    totalMealsSaved: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    socketId: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compute average rating
userSchema.methods.updateRating = function (newRating) {
  const total = this.rating * this.ratingCount + newRating;
  this.ratingCount += 1;
  this.rating = total / this.ratingCount;
};

module.exports = mongoose.model('User', userSchema);
