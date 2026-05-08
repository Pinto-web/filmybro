const express = require('express');
const { protect } = require('../middleware/auth');
const Playlist = require('../models/Playlist');
const User = require('../models/User');

const router = express.Router();

// GET all playlists globally (Community)
router.get('/global', protect, async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('user', 'name badges')
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all playlists by current user
router.get('/my', protect, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id })
      .populate('user', 'name badges')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create new playlist / tierlist
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, isTierList, flatItems, tiers } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const playlist = await Playlist.create({
      user: req.user.id,
      title,
      description,
      isTierList,
      flatItems,
      tiers
    });

    const populated = await Playlist.findById(playlist._id).populate('user', 'name badges');
    
    // BADGE LOGIC
    const userDoc = await User.findById(req.user.id);
    let newBadges = [];
    if (userDoc) {
      const listCount = await Playlist.countDocuments({ user: req.user.id });
      if (listCount === 1 && !userDoc.badges.includes("Curator")) {
        userDoc.badges.push("Curator");
        newBadges.push("Curator");
        await userDoc.save();
      }
    }

    res.status(201).json({ success: true, data: populated, newBadges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Like/unlike a playlist
router.put('/:id/like', protect, async (req, res) => {
  try {
    const list = await Playlist.findById(req.params.id);
    if (!list) return res.status(404).json({ error: 'Playlist not found' });

    const index = list.likes.indexOf(req.user.id);
    if (index !== -1) {
      list.likes.splice(index, 1);
    } else {
      list.likes.push(req.user.id);
    }
    
    await list.save();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
