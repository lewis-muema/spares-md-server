const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  baseFee: {
    type: Number,
    required: true,
  },
  priorityFee: {
    type: Number,
    required: true,
  },
  outBoundsFee: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  loaderCost: {
    type: Number,
    required: true,
  },
  serviceFee: {
    type: Number,
    required: true,
  },
  VAT: {
    type: Number,
    required: true,
  },
  vehicle: {
    type: String,
    required: true,
  },
});

mongoose.model('Pricing', pricingSchema);
