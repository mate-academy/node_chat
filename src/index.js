/* eslint-disable no-console */
'use strict';

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

app.listen(
  process.env.PORT,
  () => console.log(`Server running on port ${process.env.PORT}`)
);
