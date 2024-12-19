const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date, // Date of birth
    default: null, // Default value is null, making it optional
  },
  linkedIn: {
    type: String, // LinkedIn profile link
    default: null, // Default value is null, making it optional
  },
  role: {
    type: String,
    enum: ['user', 'company', 'course provider'], // Updated roles
    default: 'user', // Default role
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
    type: Number, // 0 for disabled, 1 for enabled
    default: 1, // Default status is enabled
  },
  deletionStatus: {
    type: Number, // 0 for not deleted, 1 for deleted
    default: 0, // Default is not deleted
  },
});

const collection = mongoose.model('collection', newSchema);

module.exports = collection;
