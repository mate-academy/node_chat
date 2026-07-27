'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { router: messageRouter } = require('./routes/messages.route');
const { router: userRouter } = require('./routes/users.route');
const { router: roomsRouter } = require('./routes/rooms.route');
const { router: authRouter } = require('./routes/auth.route');
const { router: settingsRouter } = require('./routes/settings.route');
const { authMiddleware } = require('./middlewares/auth.middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');
const cookieparser = require('cookie-parser');

require('./utils/dbDependencies');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieparser());
app.use(authRouter);
app.use('/messages', authMiddleware, messageRouter);
app.use('/users', authMiddleware, userRouter);
app.use('/rooms', authMiddleware, roomsRouter);
app.use('/settings', authMiddleware, settingsRouter);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use(errorMiddleware);

const server = app.listen(process.env.PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port ' + (process.env.PORT || 3000));
});

const { initWebSocket } = require('./websocket');

initWebSocket(server);
