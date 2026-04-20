const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, role, phone, organization, address, lat, lng } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'donor',
      phone,
      organization,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0],
      },
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        avatar: user.avatar,
        rating: user.rating,
        totalDonations: user.totalDonations,
        totalPickups: user.totalPickups,
        totalMealsSaved: user.totalMealsSaved,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        avatar: user.avatar,
        rating: user.rating,
        totalDonations: user.totalDonations,
        totalPickups: user.totalPickups,
        totalMealsSaved: user.totalMealsSaved,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @route PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  const { name, phone, organization, address, lat, lng } = req.body;
  try {
    const update = { name, phone, organization, address };
    if (lat && lng) {
      update.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
