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
        required: false,
      },
      street: {
        type: String,
        required: false,
      },
      town: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: true,
      },
    },
    required: false,
  },
  deliveryOptions: {
    type: [{
      deliveryType: {
        type: String,
        required: true,
      },
      fee: {
        type: Number,
        required: false,
      },
      currency: {
        type: String,
        required: false,
      },
      openingTime: {
        type: String,
        required: false,
      },
      closingTime: {
        type: String,
        required: false,
      },
    }],
    required: false,
  },
});

mongoose.model('Stores', storeSchema);
