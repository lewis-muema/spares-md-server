/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const Models = mongoose.model('CarModels');
const MFG = mongoose.model('MFG');

const router = express.Router();
router.use(requireAuth);


router.get('/car-models', async (req, res) => {
  const models = await Models.find();
  if (models.length) {
    res.status(200).send({ models, message: 'Car models fetched successfully' });
  } else {
    res.status(400).send({ message: 'No car models found' });
  }
});

router.post('/car-models', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const {
      manufacturer, name, year, description,
    } = req.body;
    const mfg = await MFG.findOne({ name: manufacturer }, {
      returnOriginal: true,
    });
    if (mfg) {
      const models = new Models({
        manufacturerId: mfg.id, name, year, description,
      });
      models.save().then((model) => {
        res.status(200).send({
          data: {
            manufacturer,
            name: model.name,
            year: model.year,
            description: model.description,
          },
          message: 'This car model has been added',
        });
      }).catch((err) => {
        res.status(400).send({ message: 'Failed to add car model', error: err.message });
      });
    } else {
      res.status(400).send({ message: 'Failed to find this manufacturer' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to create a car model' });
  }
});

router.put('/car-models/:id', async (req, res) => {
  if (req.user && req.user.role === 'admin') {
    const { name, year, description } = req.body;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const model = await Models.findOneAndUpdate({ _id: id }, { name, year, description }, {
          returnOriginal: false,
        });
        if (model) {
          res.status(200).send({
            data: { name: model.name, year: model.year, description: model.description }, message: 'Car model updated successfully',
          });
        } else {
          res.status(200).send({ message: 'This car model cannot be found' });
        }
      } catch (err) {
        res.status(400).send({ message: `Failed to update this car model - ${err.message}` });
      }
    } else {
      res.status(400).send({ message: 'Could not find config' });
    }
  } else {
    res.status(400).send({ message: 'You dont have the permissions to edit a car model' });
  }
});

router.delete('/car-models/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const model = await Models.findOneAndDelete({ _id: req.params.id });
      if (model) {
        res.status(200).send({
          name: model.name, message: 'This car model has been deleted',
        });
      } else {
        res.status(200).send({ message: 'This car model cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete this car model, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This car model cannot be found' });
  }
});

router.post('/delete-car-models', async (req, res) => {
  if (Array.isArray(req.body) && req.body.length > 0) {
    try {
      const models = await Models.deleteMany({ _id: { $in: req.body } });
      res.status(200).send({ message: 'These car models have been deleted', deleted: models.deletedCount });
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete these car models, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'Please send an array of ids in the payload', data: req.body });
  }
});

module.exports = router;
