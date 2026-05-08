const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      try {
        req.user = await User.findById(decoded.id);
        if (!req.user) {
          return res.status(401).json({ error: 'User deleted or not found' });
        }
        next();
      } catch (dbError) {
        return res.status(500).json({ error: 'Database connection failed' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// GET user watchlist
router.get('/watchlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.watchlist || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// POST toggle movie in watchlist
router.post('/watchlist/toggle', protect, async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ error: 'Movie ID required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const stringId = String(movieId);
    let added = false;

    if (user.watchlist && user.watchlist.includes(stringId)) {
      user.watchlist.pull(stringId);
      added = false;
    } else {
      user.watchlist.push(stringId);
      added = true;
    }
    
    await user.save();
    res.json({ watchlist: user.watchlist, added });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

// GET all users (for tagging)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('name _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
