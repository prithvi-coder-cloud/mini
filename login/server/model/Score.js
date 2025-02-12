const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  email: { type: String, required: true },
  jobTitle: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  companyId: { type: String, required: true }
});

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
