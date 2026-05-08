const Review = require('../models/Review');

exports.getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId }).populate('user', 'name');
    
    let stats = { count: 0, average: 0 };
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      stats.count = reviews.length;
      stats.average = (total / reviews.length).toFixed(1);
    }
    
    res.status(200).json({ success: true, count: reviews.length, data: reviews, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addOrUpdateReview = async (req, res) => {
  try {
    const { movieId, hype, reality, rating, review, tags, isSpoiler, wouldRewatch, taggedBros } = req.body;
    const userId = req.user.id;

    let audit = await Review.findOne({ user: userId, movieId });

    if (audit) {
      // Update
      audit.hype = hype;
      audit.reality = reality;
      audit.rating = rating;
      audit.review = review;
      audit.tags = tags;
      audit.isSpoiler = isSpoiler;
      audit.wouldRewatch = wouldRewatch;
      audit.taggedBros = taggedBros;
      await audit.save();
      return res.status(200).json({ success: true, data: audit });
    }

    // Create new
    audit = await Review.create({
      user: userId,
      movieId,
      hype, reality, rating, review, tags, isSpoiler, wouldRewatch, taggedBros
    });

    // BADGE LOGIC
    const User = require('../models/User');
    const userDoc = await User.findById(userId);
    let newBadges = [];
    if (userDoc) {
      const reviewCount = await Review.countDocuments({ user: userId });
      
      const awardBadge = (badgeName) => {
        if (!userDoc.badges.includes(badgeName)) {
          userDoc.badges.push(badgeName);
          newBadges.push(badgeName);
        }
      };

      if (reviewCount === 1) awardBadge("First Blood");
      if (reviewCount >= 10) awardBadge("Binge Watcher");
      if (rating <= 2) awardBadge("Hater");
      if (rating >= 9) awardBadge("Glazer");
      if (tags && tags.length >= 3) awardBadge("Tag Master");

      if (newBadges.length > 0) {
        await userDoc.save();
      }
    }

    res.status(201).json({ success: true, data: audit, newBadges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.find({ user: userId });
    
    const formattedMap = {};
    reviews.forEach(r => {
      formattedMap[r.movieId] = r;
    });

    res.status(200).json({ success: true, count: reviews.length, dataMap: formattedMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
