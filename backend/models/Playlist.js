const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlaylistItemSchema = new Schema({
  movieId: { type: Number, required: true },
  title: { type: String, required: true },
  posterPath: { type: String }
}, { _id: false });

const TierSchema = new Schema({
  label: { type: String, required: true }, 
  color: { type: String, default: '#374151' }, // zinc-700
  items: [PlaylistItemSchema]
}, { _id: false });

const PlaylistSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 300,
    default: ''
  },
  isTierList: {
    type: Boolean,
    default: false
  },
  flatItems: [PlaylistItemSchema],
  tiers: [TierSchema],
  likes: [{ // Array of User IDs who liked the playlist
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);
