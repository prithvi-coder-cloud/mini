const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  companyId: { type: String, required: true },
  questions: [
    {
      questionNumber: { type: Number, required: true },
      question: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: String, required: true },
    },
  ],
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
