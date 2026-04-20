const FoodPost = require('../models/FoodPost');
const User = require('../models/User');
const { Notification } = require('../models/index');

// @route POST /api/food-posts
exports.createPost = async (req, res) => {
  try {
    const {
      title, foodType, description, quantity, quantityUnit,
      cookedAt, expiryTime, address, lat, lng, tags, isUrgent,
    } = req.body;

    const images = req.files ? req.files.map((f) => f.path) : [];

    const post = await FoodPost.create({
      donor: req.user._id,
      title,
      foodType,
      description,
      quantity: parseInt(quantity),
      quantityUnit: quantityUnit || 'servings',
      cookedAt: new Date(cookedAt),
      expiryTime: new Date(expiryTime),
      images,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      address,
      tags: tags ? JSON.parse(tags) : [],
      isUrgent: isUrgent === 'true',
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalDonations: 1 } });

    // Notify nearby NGOs via socket
    req.io.emit('new_food_post', {
      post: await post.populate('donor', 'name organization avatar rating'),
      message: `New food available from ${req.user.name}`,
    });

    // Persist notifications for all NGOs
    const ngos = await User.find({ role: 'ngo', isActive: true });
    const notifications = ngos.map((ngo) => ({
      recipient: ngo._id,
      sender: req.user._id,
      type: 'new_food_post',
      title: 'New Food Available!',
      message: `${req.user.name || req.user.organization} posted food: ${title} (${quantity} servings)`,
      data: { postId: post._id },
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/food-posts  (NGOs see nearby available posts)
exports.getPosts = async (req, res) => {
  try {
    const {
      lat, lng, maxDistance = 20000, status, foodType,
      minQty, page = 1, limit = 20,
    } = req.query;

    let query = {};

    // Geo-based search if coordinates provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    if (status) query.status = status;
    else query.status = 'available'; // Default: only available

    if (foodType) query.foodType = foodType;
    if (minQty) query.quantity = { $gte: parseInt(minQty) };

    // Only show non-expired
    query.expiryTime = { $gt: new Date() };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await FoodPost.find(query)
      .populate('donor', 'name organization avatar rating phone')
      .populate('acceptedBy', 'name organization avatar')
      .sort({ isUrgent: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoodPost.countDocuments(query);

    res.json({ success: true, posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/food-posts/my  (Donor's own posts)
exports.getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { donor: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await FoodPost.find(query)
      .populate('acceptedBy', 'name organization avatar phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoodPost.countDocuments(query);
    res.json({ success: true, posts, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/food-posts/:id
exports.getPost = async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id)
      .populate('donor', 'name organization avatar rating phone address')
      .populate('acceptedBy', 'name organization avatar phone');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route PUT /api/food-posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    if (post.status !== 'available')
      return res.status(400).json({ success: false, message: 'Cannot edit non-available post' });

    const allowed = ['title', 'foodType', 'description', 'quantity', 'cookedAt', 'expiryTime', 'address', 'isUrgent', 'tags'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });

    if (req.body.lat && req.body.lng) {
      post.location = { type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)] };
    }

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route DELETE /api/food-posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    post.status = 'cancelled';
    await post.save();

    res.json({ success: true, message: 'Post cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/food-posts/map/all  (All active posts for map view)
exports.getMapPosts = async (req, res) => {
  try {
    const posts = await FoodPost.find({
      status: 'available',
      expiryTime: { $gt: new Date() },
    })
      .select('title location quantity foodType expiryTime isUrgent donor address')
      .populate('donor', 'name organization')
      .limit(200);

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
