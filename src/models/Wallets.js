/* eslint-disable */
const mongoose = require('mongoose');

const walletsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
    required: true,
  },
  userEmail: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  topUpMethods: {
    type: [{
      paymentMethod: {
        type: String,
        required: true,
      },
      provider: {
        type: String,
        required: true,
      },
      cardNumber: {
        type: Number,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      issuer: {
        type: String,
        required: false,
      },
      expiry: {
        type: String,
        required: false,
      }
    }],
    required: false,
  }
});

mongoose.model('Wallets', walletsSchema);
