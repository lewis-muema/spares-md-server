/* eslint-disable */
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: {
      building: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: false,
      },
      town: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    required: true,
  },
  deliveryOptions: {
    type: [{
      deliveryType: {
        type: String,
        required: true,
      },
      fee: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
      openingTime: {
        type: String,
        required: true,
      },
      closingTime: {
        type: String,
        required: true,
      },
    }],
    required: true,
  },
});

mongoose.model('Stores', storeSchema);
