/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const errorParse = require('../utils/errorParse');
const organizeLocations = require('../utils/locations');

const Pricing = mongoose.model('Pricing');

const router = express.Router();
router.use(requireAuth);


router.post('/pricing', async (req, res) => {
  const {
    location, priority, productPrice,
  } = req?.body;
  let { vehicle } = req?.body;
  const loc = organizeLocations(location);
  vehicle = vehicle || 'Bike';
  const pricing = await Pricing.findOne({ vehicle });
  if (!productPrice) {
    return res.status(400).send({ message: 'Please send the price of the product' });
  }
  try {
    const {
      baseFee, currency, priorityFee, outBoundsFee, serviceFee, VAT, loaderCost,
    } = pricing;
    let total = 0;
    let productTotal = productPrice;
    if (loc.town === 'Nairobi') {
      total = baseFee;
    } else {
      total = baseFee + outBoundsFee;
    }
    if (priority) {
      total += priorityFee;
    }
    if (productPrice) {
      productTotal = (productPrice * VAT / 100) + (productPrice * serviceFee / 100) + productPrice;
    }
    res.status(200).send({
      message: 'Pricing fetched successfully',
      deliveryFee: total,
      productTotal,
      currency,
      VATRate: `${VAT}%`,
      serviceFeeRate: `${serviceFee}%`,
      VAT: productPrice * VAT / 100,
      serviceFee: productPrice * serviceFee / 100,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/add-pricing', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const {
      baseFee,
      priorityFee,
      outBoundsFee,
      currency,
      loaderCost,
      serviceFee,
      VAT,
      vehicle,
    } = req.body;
    const pricing = new Pricing({
      baseFee,
      priorityFee,
      outBoundsFee,
      currency,
      loaderCost,
      serviceFee,
      VAT,
      vehicle,
    });
    pricing.save().then((price) => {
      res.status(200).send({
        data: price,
        message: 'This pricing model has been added',
      });
    }).catch((err) => {
      res.status(400).send({ message: 'Failed to add this pricing model', error: errorParse(err.message) });
    });
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create this pricing' });
  }
});

router.put('/pricing/:id', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const {
      baseFee,
      priorityFee,
      outBoundsFee,
      currency,
      loaderCost,
      serviceFee,
      VAT,
      vehicle,
    } = req.body;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const price = await Pricing.findOneAndUpdate({ _id: id }, {
          baseFee,
          priorityFee,
          outBoundsFee,
          currency,
          loaderCost,
          serviceFee,
          VAT,
          vehicle,
        }, {
          returnOriginal: false,
        });
        if (price) {
          res.status(200).send({
            data: price, message: 'Pricing updated successfully',
          });
        } else {
          res.status(200).send({ message: 'This pricing cannot be found' });
        }
      } catch (err) {
        res.status(400).send({ message: 'Failed to update this pricing', error: errorParse(err.message) });
      }
    } else {
      res.status(400).send({ message: 'This id is not valid' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create this pricing' });
  }
});

router.delete('/pricing/:id', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const price = await Pricing.findOneAndDelete({ _id: req.params.id });
        if (price) {
          res.status(200).send({
            name: price.vehicle, message: 'This pricing model has been deleted',
          });
        } else {
          res.status(200).send({ message: 'This pricing model cannot be found' });
        }
      } catch (err) {
        res.status(400).send({ message: 'Failed to delete this pricing model, Please try again later' });
      }
    } else {
      res.status(400).send({ message: 'This id is not valid' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create this pricing' });
  }
});

module.exports = router;
