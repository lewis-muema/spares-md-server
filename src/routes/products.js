/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const errorParse = require('../utils/errorParse');
const getUrl = require('../utils/fetchImageURL');

const Products = mongoose.model('Products');

const router = express.Router();
router.use(requireAuth);


router.get('/products', async (req, res) => {
  const products = await Products.find({ userId: req.user._id });
  if (products.length) {
    const productsWithUrls = await getUrl(products);
    res.status(200).send({
      products: productsWithUrls, message: 'Products fetched successfully',
    });
  } else {
    res.status(400).send({ message: 'No products found' });
  }
});

router.post('/products-search', async (req, res) => {
  const params = Object.entries(req.body).reduce(
    (a, [k, v]) => (v == null ? a : (a[k] = v, a)), {},
  );
  if (params.name) {
    params.name = { $regex: `.*${params.name.toLowerCase()}*.` };
  }
  const products = await Products.find(params);
  const productsWithUrls = await getUrl(products);
  if (products.length) {
    res.status(200).send({
      products: productsWithUrls, message: 'Products fetched successfully',
    });
  } else {
    res.status(400).send({ message: 'No products found' });
  }
});

router.post('/products', async (req, res) => {
  const {
    userId,
    name,
    storeId,
    price,
    modelId,
    manufacturerId,
    variants,
    description,
    serialNo,
    currency,
    image,
  } = req.body;
  const products = new Products({
    userId: userId || req.user._id,
    name: name.toLowerCase(),
    storeId,
    price,
    modelId,
    manufacturerId,
    variants,
    description,
    serialNo,
    currency,
    image,
  });
  products.save().then((product) => {
    res.status(200).send({
      data: product,
      message: 'This product has been added',
    });
  }).catch((err) => {
    res.status(400).send({ message: 'Failed to add this product', error: errorParse(err.message) });
  });
});

router.put('/products/:id', async (req, res) => {
  const {
    name,
    price,
    modelId,
    manufacturerId,
    variants,
    description,
    serialNo,
    currency,
    image,
  } = req.body;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const product = await Products.findOneAndUpdate({ _id: id }, {
        name: name.toLowerCase(),
        price,
        modelId,
        manufacturerId,
        variants,
        description,
        serialNo,
        currency,
        image,
      }, {
        returnOriginal: false,
      });
      if (product) {
        res.status(200).send({
          data: product, message: 'Product updated successfully',
        });
      } else {
        res.status(200).send({ message: 'This product cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to update this product', error: errorParse(err.message) });
    }
  } else {
    res.status(400).send({ message: 'This id is not valid' });
  }
});

router.delete('/products/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const product = await Products.findOneAndDelete({ _id: req.params.id });
      if (product) {
        res.status(200).send({
          name: product.name, message: 'This product has been deleted',
        });
      } else {
        res.status(200).send({ message: 'This product cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete this product, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This id is not valid' });
  }
});

router.post('/delete-products', async (req, res) => {
  if (Array.isArray(req.body) && req.body.length > 0) {
    try {
      const products = await Products.deleteMany({ _id: { $in: req.body } });
      res.status(200).send({ message: 'These products have been deleted', deleted: products.deletedCount });
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete these products, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'Please send an array of ids in the payload', data: req.body });
  }
});

module.exports = router;
