/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const errorParse = require('../utils/errorParse');

const Transactions = mongoose.model('Transactions');

const router = express.Router();
router.use(requireAuth);


router.get('/transactions', async (req, res) => {
  const transactions = await Transactions.find({ userId: req.user._id });
  if (transactions.length) {
    res.status(200).send({
      transactions, message: 'Transactions fetched successfully',
    });
  } else {
    res.status(400).send({ message: 'No transactions found' });
  }
});

router.post('/transactions', async (req, res) => {
  const {
    type,
    products,
    userId,
    storeId,
    paymentMethod,
    totalAmount,
    paidStatus,
    walletId,
    walletAmount,
    currency,
    date,
    deliveryDetails,
  } = req.body;
  const transactions = new Transactions({
    type,
    products,
    userId,
    storeId,
    paymentMethod,
    totalAmount,
    paidStatus,
    walletId,
    walletAmount,
    currency,
    date,
    deliveryDetails,
  });
  transactions.save().then((transaction) => {
    res.status(200).send({
      data: transaction,
      message: 'This transaction has been added',
    });
  }).catch((err) => {
    res.status(400).send({ message: 'Failed to add this transaction', error: errorParse(err.message) });
  });
});

router.put('/transactions/:id', async (req, res) => {
  const {
    paidStatus,
    deliveryDetails,
  } = req.body;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const transaction = await Transactions.findOneAndUpdate({ _id: id }, {
        paidStatus,
        deliveryDetails,
      }, {
        returnOriginal: false,
      });
      if (transaction) {
        res.status(200).send({
          data: transaction, message: 'Transaction updated successfully',
        });
      } else {
        res.status(200).send({ message: 'This transaction cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to update this transaction', error: errorParse(err.message) });
    }
  } else {
    res.status(400).send({ message: 'This id is not valid' });
  }
});

module.exports = router;
