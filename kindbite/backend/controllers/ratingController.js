const { Rating, Notification } = require('../models/index');
const User = require('../models/User');

// @route POST /api/ratings
exports.submitRating = async (req, res) => {
  try {
    const { rateeId, postId, score, comment, type } = req.body;

    const existing = await Rating.findOne({ rater: req.user._id, foodPost: postId });
    if (existing) return res.status(400).json({ success: false, message: 'Already rated for this post' });

    const rating = await Rating.create({
      rater: req.user._id,
      ratee: rateeId,
      foodPost: postId,
      score: parseInt(score),
      comment,
      type,
    });

    // Update ratee's average rating
    const ratee = await User.findById(rateeId);
    if (ratee) {
      ratee.updateRating(parseInt(score));
      await ratee.save();
    }

    // Notify ratee
    await Notification.create({
      recipient: rateeId,
      sender: req.user._id,
      type: 'new_rating',
      title: 'New Rating Received',
      message: `${req.user.name} gave you a ${score}-star rating.`,
      data: { postId, score },
    });

    res.status(201).json({ success: true, rating });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route GET /api/ratings/:userId
exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId })
      .populate('rater', 'name organization avatar')
      .populate('foodPost', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
