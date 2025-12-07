const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  items: {
    type: [String],
    default: []
  },
  exits: {
    type: Map, // Key: Direction (north, south), Value: RoomID or Object with locked state
    of: mongoose.Schema.Types.Mixed // Can be string (roomID) or object { roomId, locked, keyItem }
  },
  puzzle: {
    type: Object, // { type: 'item'|'riddle', requirement: 'key', hint: '...', solved: false, attempts: 0 }
    default: null
  }
});

module.exports = mongoose.model('Room', roomSchema);
