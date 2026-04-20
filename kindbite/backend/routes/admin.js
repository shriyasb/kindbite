const express = require('express');
const router = express.Router();
const { getStats, getUsers, toggleUser, getPosts } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/toggle', protect, authorize('admin'), toggleUser);
router.get('/posts', protect, authorize('admin'), getPosts);

module.exports = router;
