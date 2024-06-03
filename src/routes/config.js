/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const requireAuth = require('../middlewares/requireAuth');
const hash = require('../utils/hash');
const errorParse = require('../utils/errorParse');

const Config = mongoose.model('Config');

const router = express.Router();
router.use(requireAuth);


router.get('/get-photo-configs', async (req, res) => {
  const id = new mongoose.Types.ObjectId('662b9cab121e2e3deadf4a86');
  let config = await Config.findOne({ _id: id });
  if (!config) {
    config = await Config.findOne({ name: 'photos' });
  }
  if (config) {
    const response = await axios.post(
      'https://www.googleapis.com/oauth2/v3/token',
      {
        client_id: hash(false, config.configuration.clientId),
        client_secret: hash(false, config.configuration.clientSecret),
        refresh_token: hash(false, config.configuration.refreshToken),
        grant_type: 'refresh_token',
      },
    );
    res.status(200).send({
      access_token: response?.data?.access_token, message: 'Config fetched successfully',
    });
  } else {
    res.status(400).send({ message: 'No Config found' });
  }
});

router.post('/create-config', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const { configuration, name } = req.body;
    Object.keys(configuration).forEach((key) => {
      configuration[key] = hash(true, typeof configuration[key] === 'string' ? configuration[key] : configuration[key].toString());
    });
    const config = new Config({ configuration, name });
    config.save().then(() => {
      res.status(200).send({ message: 'This config has been created' });
    }).catch((err) => {
      res.status(400).send({ message: `Failed to create config - ${errorParse(err.message)}` });
    });
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create a configuration' });
  }
});

router.put('/update-config/:id', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const { configuration, name } = req.body;
    Object.keys(configuration).forEach((key) => {
      configuration[key] = hash(true, configuration[key]);
    });
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const config = await Config.findOneAndUpdate({ _id: id }, { configuration, name }, {
          returnOriginal: false,
        });
        if (config) {
          res.status(200).send({
            name: config.name, message: 'Config updated successfully',
          });
        } else {
          res.status(200).send({ message: 'This config cannot be found' });
        }
      } catch (err) {
        res.status(400).send({ message: `Failed to update this config - ${errorParse(err.message)}` });
      }
    } else {
      res.status(400).send({ message: 'This id is not valid' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to update this configuration' });
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
