/* eslint-disable import/no-extraneous-dependencies */
require('./models/Users');
require('./models/Config');
require('./models/Token');
require('./models/MFG');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const account = require('./routes/account');
const config = require('./routes/config');
const manufacturers = require('./routes/manufacturers');
const requireAuth = require('./middlewares/requireAuth');

const app = express();

app.use(bodyParser.json());
app.use(auth);
app.use(account);
app.use(config);
app.use(manufacturers);

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
