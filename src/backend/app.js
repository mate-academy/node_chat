'use strict';

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', authRoutes);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
