/* eslint-disable */
const mongoose = require('mongoose');

const payMethodSchema = new mongoose.Schema({
  paytype: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    required: true,
  },
});

mongoose.model('Paymethods', payMethodSchema);
