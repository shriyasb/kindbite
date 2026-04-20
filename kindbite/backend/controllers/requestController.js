const { Request, Notification } = require('../models/index');
const FoodPost = require('../models/FoodPost');
const User = require('../models/User');

// @route POST /api/requests/:postId/accept
exports.acceptRequest = async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.status !== 'available')
      return res.status(400).json({ success: false, message: 'Post is no longer available' });

    // Check if NGO already has an active request
    const existing = await Request.findOne({ ngo: req.user._id, status: { $in: ['pending', 'accepted'] } });
    if (existing)
      return res.status(400).json({ success: false, message: 'You already have an active pickup' });

    const request = await Request.create({
      foodPost: post._id,
      donor: post.donor,
      ngo: req.user._id,
      status: 'accepted',
      peopleServed: post.quantity,
    });

    post.status = 'accepted';
    post.acceptedBy = req.user._id;
    post.acceptedAt = new Date();
    await post.save();

    // Notify donor
    const notification = await Notification.create({
      recipient: post.donor,
      sender: req.user._id,
      type: 'request_accepted',
      title: 'Someone accepted your donation!',
      message: `${req.user.name || req.user.organization} will pick up your food donation.`,
      data: { postId: post._id, requestId: request._id },
    });

    // Emit to donor via socket
    req.io.to(post.donor.toString()).emit('request_accepted', {
      request: await request.populate(['foodPost', 'ngo']),
      notification,
    });

    res.json({ success: true, request });
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route PUT /api/requests/:requestId/pickup
exports.markPickedUp = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.ngo.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (request.status !== 'accepted')
      return res.status(400).json({ success: false, message: 'Cannot mark this request as picked up' });

    request.status = 'picked_up';
    request.pickedUpAt = new Date();
    await request.save();

    await FoodPost.findByIdAndUpdate(request.foodPost, {
      status: 'picked_up',
      pickedUpAt: new Date(),
    });

    // Notify donor
    await Notification.create({
      recipient: request.donor,
      sender: req.user._id,
      type: 'food_picked_up',
      title: 'Food Picked Up!',
      message: `${req.user.name || req.user.organization} has picked up your food donation.`,
      data: { requestId: request._id },
    });

    req.io.to(request.donor.toString()).emit('food_picked_up', { requestId: request._id });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route PUT /api/requests/:requestId/deliver
exports.markDelivered = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.ngo.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (request.status !== 'picked_up')
      return res.status(400).json({ success: false, message: 'Mark as picked up first' });

    const { peopleServed } = req.body;
    request.status = 'delivered';
    request.deliveredAt = new Date();
    if (peopleServed) request.peopleServed = parseInt(peopleServed);
    await request.save();

    const post = await FoodPost.findByIdAndUpdate(
      request.foodPost,
      { status: 'delivered', deliveredAt: new Date(), mealsSaved: request.peopleServed },
      { new: true }
    );

    // Update stats
    await User.findByIdAndUpdate(request.donor, { $inc: { totalMealsSaved: request.peopleServed } });
    await User.findByIdAndUpdate(request.ngo, { $inc: { totalPickups: 1, totalMealsSaved: request.peopleServed } });

    // Notify donor
    await Notification.create({
      recipient: request.donor,
      sender: req.user._id,
      type: 'food_delivered',
      title: 'Food Delivered! 🎉',
      message: `Your donation was delivered. ${request.peopleServed} meals saved!`,
      data: { requestId: request._id, mealsSaved: request.peopleServed },
    });

    req.io.to(request.donor.toString()).emit('food_delivered', {
      requestId: request._id,
      mealsSaved: request.peopleServed,
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/requests/my
exports.getMyRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'ngo' ? { ngo: req.user._id } : { donor: req.user._id };
    const { status, page = 1, limit = 10 } = req.query;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await Request.find(filter)
      .populate('foodPost', 'title foodType quantity images address status expiryTime')
      .populate('donor', 'name organization avatar phone rating')
      .populate('ngo', 'name organization avatar phone rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(filter);
    res.json({ success: true, requests, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route PUT /api/requests/:requestId/cancel
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    request.status = 'cancelled';
    await request.save();

    await FoodPost.findByIdAndUpdate(request.foodPost, {
      status: 'available',
      acceptedBy: null,
      acceptedAt: null,
    });

    res.json({ success: true, message: 'Request cancelled, post is available again' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
