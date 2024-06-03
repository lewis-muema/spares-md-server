/* eslint-disable import/no-extraneous-dependencies */
require('./models/Users');
require('./models/Config');
require('./models/Token');
require('./models/MFG');
require('./models/CarModels');
require('./models/Wallets');
require('./models/Stores');
require('./models/Products');
require('./models/Transactions');
require('./models/PayMethods');
require('./models/pricing');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const account = require('./routes/account');
const config = require('./routes/config');
const manufacturers = require('./routes/manufacturers');
const models = require('./routes/models');
const wallets = require('./routes/wallets');
const stores = require('./routes/stores');
const products = require('./routes/products');
const transactions = require('./routes/transaction');
const payMethods = require('./routes/payMethods');
const pricing = require('./routes/pricing');
const requireAuth = require('./middlewares/requireAuth');

const app = express();

app.use(bodyParser.json());
app.use(auth);
app.use(account);
app.use(config);
app.use(manufacturers);
app.use(models);
app.use(wallets);
app.use(stores);
app.use(products);
app.use(transactions);
app.use(payMethods);
app.use(pricing);

const mongoURI = 'mongodb+srv://lewismuema96:OFxzxEG9Rv6XZhhf@cluster0.toiwtbf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI);
mongoose.connection.on('connected', () => {
  console.log('Successfully connected');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MonngoDB', err);
});

app.get('/_ah/warmup', (req, res) => {
  res.send('Warmup');
});

app.get('/', requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

app.listen(8080, () => {
  console.log('Listening on port 8080');
});
