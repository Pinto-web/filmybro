const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  age: {
    type: Number,
    required: [true, 'Please provide your age'],
    min: [13, 'You must be at least 13 years old']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [4, 'Password must be at least 4 characters'],
    select: false,
  },
  watchlist: {
    type: [String],
    default: [],
  },
  swipedMovies: [{
    movieId: String,
    action: { type: String, enum: ['like', 'dislike'] }
  }],
  votedDebates: [{
    debateId: String,
    choice: Number
  }],
  badges: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
