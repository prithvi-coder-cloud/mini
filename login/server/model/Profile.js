const mongoose = require("mongoose");

// Profile schema definition
const profileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  skills: { type: String, required: true },
  linkedinProfile: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
});

// Create and export the Profile model
const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
