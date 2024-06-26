/* eslint-disable */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  manufacturer: {
    type: Object,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  model: {
    type: Object,
    required: true,
  },
  store: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  variants: {
    type: [{
      color: {
        type: String,
        required: false,
      },
      material: {
        type: String,
        required: false,
      },
      brand: {
        type: String,
        required: false,
      },
      size: {
        type: String,
        required: false,
      },
      weight: {
        type: String,
        required: false,
      },
      units: {
        type: Number,
        required: true,
      },
    }],
    required: true,
  },
  serialNo: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: true,
  },
});

mongoose.model('Products', productSchema);