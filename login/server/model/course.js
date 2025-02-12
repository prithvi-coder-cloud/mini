const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true 
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctOption: {
    type: String,
    required: true,
    trim: true
  }
});

const courseSchema = new mongoose.Schema({
  courseProviderId: {
    type: String,  // Changed back to String to match your existing implementation
    required: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  courseTutor: {
    type: String,
    required: true,
    trim: true
  },
  courseDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  paymentFee: {
    type: Number,
    required: true,
    min: 0 
  },
  courseDescription: {
    type: String,
    required: true,
    trim: true
  },
  courseMaterial: {
    type: String,
    required: true
  },
  courseLogo: {
    type: String,
    required: true
  },
  mcqQuestions: {
    type: [mcqQuestionSchema],
    validate: [
      {
        validator: function(questions) {
          return questions.length <= 10; 
        },
        message: 'Maximum 10 questions allowed'
      }
    ]
  }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
