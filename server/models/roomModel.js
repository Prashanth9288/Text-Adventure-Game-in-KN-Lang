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
    type: Map, 
    of: mongoose.Schema.Types.Mixed 
  },
  puzzle: {
    type: Object, 
    default: null
  }
});

module.exports = mongoose.model('Room', roomSchema);
