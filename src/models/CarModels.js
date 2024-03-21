/* eslint-disable */
const mongoose = require('mongoose');

const carModelsSchema = new mongoose.Schema({
  manufacturerId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

mongoose.model('CarModels', carModelsSchema);
