/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const hash = require('../utils/hash');

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
    const decrypted = {
      client_id: hash(false, config.configuration.clientId),
      client_secret: hash(false, config.configuration.clientSecret),
      refresh_token: hash(false, config.configuration.refreshToken),
    };
    config.configuration = decrypted;
    res.status(200).send({
      config, message: 'Config fetched successfully',
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
      res.status(400).send({ message: `Failed to create config - ${err.message}` });
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
        res.status(400).send({ message: `Failed to update this config - ${err.message}` });
      }
    } else {
      res.status(400).send({ message: 'This id is not valid' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to update this configuration' });
  }
});

module.exports = router;
