const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'company', 'course provider'],
    default: 'user',
  },
  resetCode: {
    type: String,
    default: '',
  },
  resetCodeExpiration: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Number,
    default: 1,
  },
  deletionStatus: {
    type: Number,
    default: 0,
  },
});

const collection = mongoose.model('collection', newSchema);

module.exports = collection;
