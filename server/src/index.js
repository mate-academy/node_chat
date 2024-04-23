/* eslint-disable no-console */
// /* eslint-disable no-console */

require('dotenv/config');

const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errorMiddleware.js');
const { runWSServer } = require('./websoket/wss.js');
const { checkDBConnection } = require('./db/db.js');
const chatRoute = require('./routes/chat.route.js');
const userRouter = require('./routes/user.route.js');
const messageRouter = require('./routes/message.route.js');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// app.use('/message', messageRoute);
app.use('/chat', chatRoute);
app.use('/user', userRouter);
app.use('/message', messageRouter);
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server run on port ${PORT}`);
});

runWSServer(server);
checkDBConnection();
