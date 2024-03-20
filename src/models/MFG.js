/* eslint-disable */
const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

mongoose.model('MFG', manufacturerSchema);
