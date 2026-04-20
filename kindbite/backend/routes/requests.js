// routes/requests.js
const express = require('express');
const router = express.Router();
const { acceptRequest, markPickedUp, markDelivered, getMyRequests, cancelRequest } = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:postId/accept', protect, authorize('ngo'), acceptRequest);
router.put('/:requestId/pickup', protect, authorize('ngo'), markPickedUp);
router.put('/:requestId/deliver', protect, authorize('ngo'), markDelivered);
router.put('/:requestId/cancel', protect, authorize('ngo', 'admin'), cancelRequest);
router.get('/my', protect, getMyRequests);

module.exports = router;
