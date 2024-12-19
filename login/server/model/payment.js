const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  userName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  paymentFee: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  receiptUrl: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('payment', PaymentSchema);
