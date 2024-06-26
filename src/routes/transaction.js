/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const errorParse = require('../utils/errorParse');
const getUrlInVariants = require('../utils/fetchImageURLVariant');

const Transactions = mongoose.model('Transactions');
const Products = mongoose.model('Products');

const router = express.Router();
router.use(requireAuth);


router.get('/transactions/:type', async (req, res) => {
  const transactions = await Transactions.find({
    userId: req.user._id,
    type: req.params.type.toUpperCase(),
  });
  const transactionsWithURLs = await getUrlInVariants(transactions);
  if (transactions.length) {
    res.status(200).send({
      transactions: transactionsWithURLs, message: 'Transactions fetched successfully',
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
  products.forEach(async (product) => {
    const prod = await Products.findOne({ variants: { $elemMatch: { _id: product.variantId } } })
      .then((doc) => {
        const item = doc.variants.id(product.variantId);
        item.units -= product.units;
        doc.save();
      }).catch((err) => {
        return res.status(400).send({ message: 'Failed to add this transaction', error: errorParse(err.message) });
      });
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
