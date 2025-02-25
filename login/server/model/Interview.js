const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true
  },
  emails: [{
    type: String,
    required: true
  }],
  roomName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', interviewSchema); 