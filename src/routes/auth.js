/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');
const hash = require('../utils/hash');


const User = mongoose.model('User');
const Token = mongoose.model('Token');
const Config = mongoose.model('Config');


const router = express.Router();
const expiry = '2160h';

router.post('/signup', (req, res) => {
  const {
    email, password, firstname, lastname, paymentMethod, type, status, currency,
  } = req.body;
  const user = new User({
    email, password, firstname, lastname, paymentMethod, type, status, currency,
  });
  user.save().then(() => {
    const token = jwt.sign({ userId: user._id }, 'SECRET', { expiresIn: expiry });
    res.status(200).send({
      message: 'User created successfully', token, email: user.email, userId: user._id,
    });
  }).catch((err) => {
    if (err.message.includes('duplicate key')) {
      res.status(400).send({ message: 'This email account already exists' });
    } else if (err.message.includes('User validation failed')) {
      res.status(400).send({ message: 'Please make sure you are sending the required fields' });
    } else {
      res.status(400).send({ message: err.message });
    }
  });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).send({ message: 'Please provide the email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send({ message: 'Email not found' });
  }

  user.comparePassword(password).then((status) => {
    if (status) {
      const token = jwt.sign({ userId: user._id }, 'SECRET', { expiresIn: expiry });
      res.status(200).send({
        token, email: user.email, userId: user._id, message: 'Successfully logged in',
      });
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  }).catch(() => {
    res.status(401).send({ message: 'Invalid email or password' });
  });
});

router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send({ message: 'This user does not exist' });
  }
  let token = await Token.findOne({ userId: user._id });
  if (!token) {
    token = await new Token({
      userId: user._id,
      token: Math.floor(100000 + Math.random() * 900000),
    }).save();
  }
  const status = await sendEmail(user.email, 'Password Reset Token', token.token);
  if (status) {
    res.status(200).send({ message: 'A password reset token has been sent to your email account', user: user.email, id: user._id });
  } else {
    res.status(400).send({ message: 'Failed to send email, Please try again later' });
  }
});

router.post('/validate-token', async (req, res) => {
  const { id, token, password } = req.body;

  if (!id || !token || !password) {
    return res.status(400).send({ message: 'Please provide the correct fields' });
  }
  if (mongoose.Types.ObjectId.isValid(id)) {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).send({ message: 'This account does not exist' });
    }
    const tokenVal = await Token.findOne({
      userId: user._id,
      token,
    });
    if (!tokenVal) return res.status(400).send({ message: 'This token is invalid' });

    user.password = req.body.password;
    await user.save();

    await Token.findOneAndDelete({
      userId: user._id,
      token,
    });

    res.status(200).send({ message: 'User password changed successfully', user: user.email });
  } else {
    return res.status(400).send({ message: 'This account does not exist' });
  }
});

router.post('/locations', async (req, res) => {
  const id = new mongoose.Types.ObjectId('6634dfcde6b1b152ab473165');
  let config = await Config.findOne({ _id: id });
  if (!config) {
    config = await Config.findOne({ name: 'places' });
  }
  const { input } = req.body;
  axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${hash(false, config.configuration.apiKey)}`).then((response) => {
    if (response?.data?.status === 'REQUEST_DENIED') {
      res.status(400).send({ message: response?.data?.error_message });
    } else {
      res.status(200).send({
        message: 'Locations fetched successfully', data: response?.data,
      });
    }
  }).catch((err) => {
    res.status(400).send({ message: 'Could not fetch locations' });
  });
});

module.exports = router;
