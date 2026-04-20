const express = require('express');
const router = express.Router();
const {
  createPost, getPosts, getMyPosts, getPost,
  updatePost, deletePost, getMapPosts,
} = require('../controllers/foodPostController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/map', protect, getMapPosts);
router.get('/my', protect, authorize('donor'), getMyPosts);
router.get('/', protect, getPosts);
router.get('/:id', protect, getPost);
router.post('/', protect, authorize('donor'), upload.array('images', 5), createPost);
router.put('/:id', protect, authorize('donor', 'admin'), updatePost);
router.delete('/:id', protect, authorize('donor', 'admin'), deletePost);

module.exports = router;
