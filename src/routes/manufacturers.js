/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const MFG = mongoose.model('MFG');

const router = express.Router();
router.use(requireAuth);


router.get('/manufacturers', async (req, res) => {
  const manufacturers = await MFG.find();
  if (manufacturers.length) {
    res.status(200).send({ manufacturers, message: 'Manufacturers fetched successfully' });
  } else {
    res.status(400).send({ message: 'No manufacturers found' });
  }
});

router.post('/manufacturers', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const { name, country, description } = req.body;
    const mfg = new MFG({ name, country, description });
    mfg.save().then((manufacturer) => {
      res.status(200).send({
        name: manufacturer.name,
        country: manufacturer.country,
        description: manufacturer.description,
        message: 'This manufacturer has been added',
      });
    }).catch((err) => {
      res.status(400).send({ message: 'Failed to add manufacturer', error: err.message });
    });
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create a manufacturer' });
  }
});

router.put('/manufacturers/:id', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const { name, country, description } = req.body;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const mfg = await MFG.findOneAndUpdate({ _id: id }, { name, country, description }, {
          returnOriginal: false,
        });
        if (mfg) {
          res.status(200).send({
            name: mfg.name, country: mfg.country, description: mfg.description, message: 'Manufacturer updated successfully',
          });
        } else {
          res.status(200).send({ message: 'This manufacturer cannot be found' });
        }
      } catch (err) {
        res.status(400).send({ message: `Failed to update this manufacturer - ${err.message}` });
      }
    } else {
      res.status(400).send({ message: 'Could not find config' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to edit a manufacturer' });
  }
});

router.delete('/manufacturers/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const mfg = await MFG.findOneAndDelete({ _id: req.params.id });
      if (mfg) {
        res.status(200).send({
          name: mfg.name, message: 'This manufacturer has been deleted',
        });
      } else {
        res.status(200).send({ message: 'This manufacturer cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete this manufacturer, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This manufacturer cannot be found' });
  }
});

router.post('/delete-manufacturers', async (req, res) => {
  if (Array.isArray(req.body) && req.body.length > 0) {
    try {
      const mfg = await MFG.deleteMany({ _id: { $in: req.body } });
      res.status(200).send({ message: 'These manufacturers have been deleted', deleted: mfg.deletedCount });
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete these manufacturers, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'Please send an array of ids in the payload', data: req.body });
  }
});

module.exports = router;
