const axios = require('axios');
const mongoose = require('mongoose');

const Config = mongoose.model('Config');
const hash = require('../utils/hash');

const getUrl = async (products) => {
  let productsWithURLs = [];
  const productIds = products.map(product => product.image);
  let param;
  productIds.forEach((id, index) => {
    if (index === 0) {
      param = `?mediaItemIds=${id}`;
    } else {
      param = `${param}&mediaItemIds=${id}`;
    }
  });
  const id = new mongoose.Types.ObjectId('662b9cab121e2e3deadf4a86');
  let config = await Config.findOne({ _id: id });
  if (!config) {
    config = await Config.findOne({ name: 'photos' });
  }
  const response = await axios.post(
    'https://www.googleapis.com/oauth2/v3/token',
    {
      client_id: hash(false, config.configuration.clientId),
      client_secret: hash(false, config.configuration.clientSecret),
      refresh_token: hash(false, config.configuration.refreshToken),
      grant_type: 'refresh_token',
    },
  );
  const photoURLS = await axios.get(
    `https://photoslibrary.googleapis.com/v1/mediaItems:batchGet${param}`,
    {
      headers: {
        Authorization: `Bearer ${response?.data?.access_token}`,
      },
    },
  );
  if (photoURLS?.data?.mediaItemResults) {
    products.forEach((product) => {
      const url = photoURLS.data.mediaItemResults
        .filter(photo => photo.mediaItem.id === product.image)
        .map(({ mediaItem }) => mediaItem)
        .map(({ baseUrl }) => baseUrl);
      const newProduct = {
        ...product.toObject(),
        photoId: product.image,
        image: url[0],
      };
      // eslint-disable-next-line prefer-destructuring
      productsWithURLs.push(newProduct);
    });
  } else {
    productsWithURLs = products;
  }
  return productsWithURLs;
};

module.exports = getUrl;
