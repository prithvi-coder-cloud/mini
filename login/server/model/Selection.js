const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  jobTitle: { type: String, required: true },
  score: { type: Number, required: true },
  selected: { type: Boolean, default: true },
  companyId: { type: String, required: true }
});

const Selection = mongoose.model('Selection', selectionSchema);

module.exports = Selection;

