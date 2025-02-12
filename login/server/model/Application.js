const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'  // This will allow referencing both user models
  },
  userModel: {
    type: String,
    required: true,
    enum: ['users', 'collection']  // Specify which model the userId refers to
  },
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
    type: String,
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
