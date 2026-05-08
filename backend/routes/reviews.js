const express = require('express');
const { addOrUpdateReview, getReviewsByMovie, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/movie/:movieId', getReviewsByMovie);
router.get('/me', protect, getUserReviews);
router.post('/', protect, addOrUpdateReview);

module.exports = router;
