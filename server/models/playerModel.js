const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  inventory: {
    type: [String],
    default: []
  },
  currentRoom: {
    type: String, // Room ID
    required: true
  },
  puzzlesSolved: {
    type: Number,
    default: 0
  },
  isAlive: {
    type: Boolean,
    default: true
  },
  lastSavedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema);
