const mongoose = require('mongoose');

const DebateSchema = new mongoose.Schema({
  debateId: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  option1Name: String,
  option1Votes: { type: Number, default: 0 },
  option2Name: String,
  option2Votes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Debate', DebateSchema);
