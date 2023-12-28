/* eslint-disable no-console */
'use strict';

require('dotenv').config();

const express = require('express');
const userRoutes = require('./routes/user');
const connectDb = require('./utils/db');

connectDb();

const app = express();

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

app.listen(
  process.env.PORT,
  () => console.log(`Server running on port ${process.env.PORT}`)
);
