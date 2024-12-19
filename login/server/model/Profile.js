const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure email is unique
  },
  phoneNumber: {
    type: String,
    required: true
  },
  linkedIn: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
