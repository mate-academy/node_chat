/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { messageRouter } = require('./routes/message.route');
const { roomRouter } = require('./routes/room.route');

require('dotenv/config');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(errorMiddleware);
app.use('/message', messageRouter);
app.use('/room', roomRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
