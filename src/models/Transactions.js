/* eslint-disable */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  products: {
    type: [{
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      variantId: {
        type: String,
        required: true,
      },
      serialNo: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
      units: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    }],
    required: false,
  },
  userId: {
    type: String,
    required: true,
  },
  storeId: {
    type: String,
    required: false,
  },
  paymentMethod: {
    type: {
      paytype: {
        type: String,
        required: true,
      },
      provider: {
        type: String,
        required: false,
      },
      id: {
        type: String,
        required: false,
      },
    },
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paidStatus: {
    type: String,
    required: false,
  },
  walletId: {
    type: String,
    required: false,
  },
  walletAmount: {
    type: Number,
    required: false,
  },
  currency: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  deliveryDetails: {
    type: {
      deliveryType: {
        type: String,
        required: true,
      },
      fee: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      address: {
        type: {
          name: {
            type: String,
            required: true,
          },
          coordinatesX: {
            type: String,
            required: false,
          },
          coordinatesY: {
            type: String,
            required: false,
          },
        },
        required: false,
      }
    },
    required: false,
  }
});

mongoose.model('Transactions', transactionSchema);