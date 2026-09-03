'use strict';

const express = require('express');
const cors = require('cors');
const roomsRoutes = require('./routes/rooms.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/rooms', roomsRoutes);

// Must be registered after the routes - Express only treats a 4-arg
// middleware as an error handler, and only errors from routes above it reach it.
app.use(errorHandler);

module.exports = app;
