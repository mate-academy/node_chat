'use strict';

const express = require('express');
const cors = require('cors');
const { userRouter } = require('./routes/user.route.js');
const { roomRouter } = require('./routes/room.routes.js');
const { errorMiddleware } = require('./middleware/errorMiddleware.js');
const { setupWebSocket } = require('./wsServer.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', userRouter);
app.use('/room', roomRouter);

app.use(errorMiddleware);

const server = app.listen(3005);

setupWebSocket(server);
