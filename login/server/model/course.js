const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String], // Array of strings to store options
    required: true,
  },
  correctOption: {
    type: String, // String to store the correct option
    required: true,
  },
});

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  courseTutor: {
    type: String,
    required: true,
  },
  courseDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  paymentFee: {
    type: Number,
    required: true,
  },
  courseDescription: {
    type: String,
    required: true,
  },
  courseMaterials: {
    type: [String], // Array of strings to store file paths
    required: true,
  },
  courseLogo: {
    type: String, // String to store the file path
    required: true,
  },
  mcqQuestions: {
    type: [mcqQuestionSchema], // Array of mcqQuestionSchema objects
    required: false, // You can set this to true if every course must have MCQ questions
  },
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
