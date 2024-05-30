/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const errorParse = require('../utils/errorParse');

const Paymethods = mongoose.model('Paymethods');

const router = express.Router();
router.use(requireAuth);

router.get('/payment-methods', async (req, res) => {
  const paymethods = await Paymethods.find();
  if (paymethods.length) {
    res.status(200).send({ paymethods, message: 'Payment methods fetched successfully' });
  } else {
    res.status(400).send({ message: 'No payment methods found' });
  }
});

router.post('/payment-methods', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    try {
      const { paytype, provider } = req.body;
      const paymethod = await Paymethods.findOne({ provider });
      if (paymethod) {
        return res.status(400).send({ message: 'Payment method already exists' });
      }
      const newMethod = new Paymethods({
        paytype, provider, active: true,
      });
      const response = await newMethod.save();
      res.status(200).send({ message: 'Payment method created successfully', data: response });
    } catch (err) {
      res.status(400).send({ message: err });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create this payment method' });
  }
});

router.put('/payment-methods/:id', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const { active } = req.body;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const paymethod = await Paymethods.findOneAndUpdate({ _id: id }, { active }, {
          returnOriginal: false,
        });
        if (paymethod) {
          res.status(200).send({
            data: { ...paymethod }, message: 'Payment method updated successfully',
          });
        } else {
          res.status(200).send({ message: 'This payment method cannot be found' });
        }
      } catch (err) {
        res.status(400).send({ message: 'Failed to update this store', error: errorParse(err.message) });
      }
    } else {
      res.status(400).send({ message: 'This id is not valid' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create this payment method' });
  }
});

router.delete('/payment-methods/:id', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const paymethod = await Paymethods.findOneAndDelete({ _id: req.params.id });
        if (paymethod) {
          res.status(200).send({
            email: paymethod.provider, message: 'This payment method has been deleted',
          });
        } else {
          res.status(200).send({ message: 'This payment method cannot be found' });
        }
      } catch (err) {
        res.status(400).send({ message: 'Failed to delete this payment method, Please try again later' });
      }
    } else {
      res.status(400).send({ message: 'This id is not valid' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create this payment method' });
  }
});

module.exports = router;
