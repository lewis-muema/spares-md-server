/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const Stores = mongoose.model('Stores');

const router = express.Router();
router.use(requireAuth);


router.get('/stores', async (req, res) => {
  const stores = await Stores.find({ userId: req.user._id });
  if (stores.length) {
    res.status(200).send({
      stores, message: 'Stores fetched successfully',
    });
  } else {
    res.status(400).send({ message: 'No Stores found' });
  }
});

router.post('/stores', async (req, res) => {
  const {
    name, address, deliveryOptions,
  } = req.body;
  const stores = new Stores({
    userId: req.user._id, name, address, deliveryOptions,
  });
  stores.save().then((store) => {
    res.status(200).send({
      data: {
        name: store.name,
        address: store.address,
        deliveryOptions: store.deliveryOptions,
      },
      message: 'This store has been added',
    });
  }).catch((err) => {
    res.status(400).send({ message: 'Failed to add this store', error: err.message });
  });
});

router.put('/stores/:id', async (req, res) => {
  const { name, address, deliveryOptions } = req.body;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const store = await Stores.findOneAndUpdate({ _id: id }, { name, address, deliveryOptions }, {
        returnOriginal: false,
      });
      if (store) {
        res.status(200).send({
          data: { name: store.name, address: store.address, deliveryOptions: store.deliveryOptions }, message: 'Store updated successfully',
        });
      } else {
        res.status(200).send({ message: 'This store cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to update this store', error: err.message });
    }
  } else {
    res.status(400).send({ message: 'This id is not valid' });
  }
});

router.delete('/stores/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const store = await Stores.findOneAndDelete({ _id: req.params.id });
      if (store) {
        res.status(200).send({
          name: store.name, message: 'This store has been deleted',
        });
      } else {
        res.status(200).send({ message: 'This store cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete this store, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This id is not valid' });
  }
});

module.exports = router;
