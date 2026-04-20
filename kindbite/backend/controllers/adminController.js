const User = require('../models/User');
const FoodPost = require('../models/FoodPost');
const { Request, Rating } = require('../models/index');

// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers, totalDonors, totalNGOs,
      totalPosts, activePosts, deliveredPosts, expiredPosts,
      totalRequests, deliveredRequests,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      FoodPost.countDocuments(),
      FoodPost.countDocuments({ status: 'available' }),
      FoodPost.countDocuments({ status: 'delivered' }),
      FoodPost.countDocuments({ status: 'expired' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'delivered' }),
    ]);

    // Total meals saved
    const mealAgg = await FoodPost.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$mealsSaved' } } },
    ]);
    const totalMealsSaved = mealAgg[0]?.total || 0;

    // Donations by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const donationsByDay = await FoodPost.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          meals: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Meals by food type
    const mealsByType = await FoodPost.aggregate([
      { $group: { _id: '$foodType', count: { $sum: 1 }, meals: { $sum: '$quantity' } } },
    ]);

    // Top donors
    const topDonors = await User.find({ role: 'donor' })
      .select('name organization avatar totalMealsSaved totalDonations rating')
      .sort({ totalMealsSaved: -1 })
      .limit(5);

    // Top NGOs
    const topNGOs = await User.find({ role: 'ngo' })
      .select('name organization avatar totalPickups totalMealsSaved rating')
      .sort({ totalMealsSaved: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, donors: totalDonors, ngos: totalNGOs },
        posts: { total: totalPosts, active: activePosts, delivered: deliveredPosts, expired: expiredPosts },
        requests: { total: totalRequests, delivered: deliveredRequests },
        totalMealsSaved,
        donationsByDay,
        mealsByType,
        topDonors,
        topNGOs,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user: { _id: user._id, isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/admin/posts
exports.getPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await FoodPost.find(query)
      .populate('donor', 'name organization avatar')
      .populate('acceptedBy', 'name organization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoodPost.countDocuments(query);
    res.json({ success: true, posts, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
