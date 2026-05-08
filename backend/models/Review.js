const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  hype: {
    type: Number,
    min: 0,
    max: 10,
    default: 5,
  },
  reality: {
    type: Number,
    min: 0,
    max: 10,
    default: 5,
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },
  review: {
    type: String,
    maxlength: 500,
  },
  tags: {
    type: [String],
    default: [],
  },
  isSpoiler: {
    type: Boolean,
    default: false,
  },
  wouldRewatch: {
    type: Boolean,
    default: null,
  },
  taggedBros: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: true });

// Ensure one user can only review a movie once
ReviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
