/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const User = mongoose.model('User');

const router = express.Router();
router.use(requireAuth);

router.get('/user-payment-methods', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (user) {
      res.status(200).send({ message: 'User payment methods retrieved successfully', paymethods: user.paymentMethod });
    } else {
      res.status(400).send({ message: 'Could not find this user' });
    }
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

router.post('/edit-account', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.paymentMethod) {
      user.paymentMethod = req.body.paymentMethod;
    }
    if (req.body.role) {
      user.role = req.body.role;
    }
    await user.save();
    res.status(200).send({ message: 'User account edited successfully', user: user.email });
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

router.delete('/delete-account', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.user._id });
    if (user) {
      res.status(200).send({
        email: user.email, message: 'This account has been deleted',
      });
    } else {
      res.status(200).send({ message: 'This account cannot be found' });
    }
  } catch (err) {
    res.status(400).send({ message: 'Failed to delete this account, Please try again later' });
  }
});

module.exports = router;
