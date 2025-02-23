const mongoose = require('mongoose');

// Define the Job Schema
const jobSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: true 
  },
  jobTitle: { 
    type: String, 
    required: true 
  },
  companyLogo: { 
    type: String, 
    required: true 
  },
  minPrice: { 
    type: Number, 
    required: true 
  },
  maxPrice: { 
    type: Number, 
    required: true 
  },
  salaryType: { 
    type: String, 
    required: true,
    enum: ['hourly', 'monthly', 'yearly']
  },
  jobLocation: { 
    type: String, 
    required: true 
  },
  postingDate: { 
    type: Date, 
    default: Date.now
  },
  expireDate: { 
    type: Date, 
    required: true
  },
  experienceLevel: { 
    type: String, 
    required: true,
    enum: ['entry', 'intermediate', 'senior', 'expert']
  },
  employmentType: { 
    type: String, 
    required: true,
    enum: ['full-time', 'part-time', 'contract', 'internship']
  },
  description: { 
    type: String, 
    required: true 
  },
  companyId: {
    type: String, 
    required: true
  },
  status: {
    type: Number,
    default: 1
  }
});

// Remove the TTL index since we don't want to delete documents
// jobSchema.index({ expireDate: 1 }, { expireAfterSeconds: 0 });

// Export the model
module.exports = mongoose.model('Job', jobSchema);
