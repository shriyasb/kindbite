const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`Socket connected: ${user.name} (${user.role}) - ${socket.id}`);

    // Join personal room (for targeted notifications)
    socket.join(user._id.toString());

    // Save socket ID
    await User.findByIdAndUpdate(user._id, { socketId: socket.id });

    // NGOs join a broadcast room to receive new post alerts
    if (user.role === 'ngo') socket.join('ngo_room');

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${user.name}`);
      await User.findByIdAndUpdate(user._id, { socketId: '' });
    });

    // Emit current user's connection confirmation
    socket.emit('connected', { message: 'Real-time connection established' });
  });
};
