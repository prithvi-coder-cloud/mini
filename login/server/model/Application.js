const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  birthDate: Date,
  street: String,
  city: String,
  state: String,
  zipCode: String,
  email: String,
  phone: String,
  linkedInProfile: String,
  resume: String,
  companyId: {
    type: mongoose.Schema.Types.Mixed, // Use Mixed type to store an object with dynamic fields
    required: true, // Ensure companyId is provided
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId, // Store jobId as an ObjectId
    ref: 'Job', // Reference the Job model
    required: true, // Ensure jobId is provided
  },
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
