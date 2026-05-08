const express = require('express');
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');
const HotTake = require('../models/HotTake');
const User = require('../models/User');

const router = express.Router();

// Get the unified global feed (Reviews + Hot Takes)
router.get('/feed', protect, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name badges')
      .populate('taggedBros', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
      
    const takes = await HotTake.find()
      .populate({ path: 'user', select: 'name badges' })
      .populate({ path: 'replies.user', select: 'name badges' })
      .sort({ createdAt: -1 })
      .limit(20);
      
    // Format feed
    const feed = [
      ...reviews.map(r => ({ ...r.toObject(), type: 'review' })),
      ...takes.map(t => ({ ...t.toObject(), type: 'take' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, count: feed.length, data: feed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new Hot Take
router.post('/takes', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const take = await HotTake.create({ user: req.user.id, content });
    
    // BADGE LOGIC
    const userDoc = await User.findById(req.user.id);
    let newBadges = [];
    if (userDoc) {
      const takeCount = await HotTake.countDocuments({ user: req.user.id });
      if (takeCount >= 5 && !userDoc.badges.includes("Yapper")) {
        userDoc.badges.push("Yapper");
        newBadges.push("Yapper");
        await userDoc.save();
      }
    }

    const populated = await HotTake.findById(take._id).populate('user', 'name badges').populate('replies.user', 'name badges');
    res.status(201).json({ success: true, data: populated, newBadges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to a specific take
router.post('/takes/:id/reply', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const take = await HotTake.findById(req.params.id);
    if (!take) return res.status(404).json({ error: 'Take not found' });

    take.replies.push({ user: req.user.id, content });
    await take.save();

    const populated = await HotTake.findById(take._id)
      .populate('user', 'name badges')
      .populate('replies.user', 'name badges');
      
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/Flame a specific post
router.put('/takes/:id/like', protect, async (req, res) => {
  try {
    const take = await HotTake.findById(req.params.id);
    if (!take) return res.status(404).json({ error: 'Take not found' });

    const index = take.likes.indexOf(req.user.id);
    if (index !== -1) {
      take.likes.splice(index, 1);
    } else {
      take.likes.push(req.user.id);
    }
    
    await take.save();
    res.status(200).json({ success: true, data: take });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Top Bros (Users with most active reviews/takes)
router.get('/top-bros', protect, async (req, res) => {
  try {
     const users = await User.find().select('name badges createdAt').limit(6);
     res.status(200).json({ success: true, data: users });
  } catch(err) {
     res.status(500).json({ error: err.message });
  }
});

module.exports = router;
