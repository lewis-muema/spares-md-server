/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const Wallets = mongoose.model('Wallets');
const User = mongoose.model('User');

const router = express.Router();
router.use(requireAuth);


router.get('/wallet', async (req, res) => {
  const wallet = await Wallets.findOne({ userId: new mongoose.Types.ObjectId(req.user._id) });
  if (wallet) {
    res.status(200).send({
      wallet: {
        id: wallet._id,
        email: wallet.userEmail,
        status: wallet.status,
        currency: wallet.currency,
        top_up_methods: wallet.topUpMethods,
      },
      message: 'Wallet fetched successfully',
    });
  } else {
    res.status(400).send({ message: 'No wallet found' });
  }
});

router.post('/wallet', async (req, res) => {
  const {
    status, currency, top_up_methods,
  } = req.body;
  const wallet = new Wallets({
    userId: req.user._id, userEmail: req.user.email, status, currency, topUpMethods: top_up_methods,
  });
  wallet.save().then((wllt) => {
    res.status(200).send({
      data: {
        id: wllt._id,
        user_email: req.user.email,
        status: wllt.status,
        currency: wllt.currency,
        top_up_methods: wllt.topUpMethods,
      },
      message: 'Wallet created',
    });
  }).catch((err) => {
    res.status(400).send({ message: 'Failed to create wallet', error: err.message });
  });
});

router.put('/wallet/:id', async (req, res) => {
  const { status, currency, top_up_methods } = req.body;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const wallet = await Wallets.findOneAndUpdate({ _id: id },
        { status, currency, topUpMethods: top_up_methods }, {
          returnOriginal: false,
        });
      if (wallet) {
        res.status(200).send({
          data: {
            id: wallet._id,
            user_email: wallet.userEmail,
            status: wallet.status,
            currency: wallet.currency,
            top_up_methods: wallet.topUpMethods,
          },
          message: 'Wallet updated successfully',
        });
      } else {
        res.status(200).send({ message: 'This wallet cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to update this wallet', error: err.message });
    }
  } else {
    res.status(400).send({ message: 'This id is not valid' });
  }
});

router.delete('/wallet/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const wallet = await Wallets.findOneAndDelete({ _id: req.params.id });
      if (wallet) {
        res.status(200).send({
          name: wallet.name, message: 'This wallet has been deleted',
        });
      } else {
        res.status(200).send({ message: 'This wallet cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete this wallet, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This id is not valid' });
  }
});

module.exports = router;
