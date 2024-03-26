'use strict';

require('dotenv/config');

const express = require('express');
const cors = require('cors');
const { corsOptions } = require('./utils/cors.js');
const { userRouter } = require('./routers/userRouter.js');
const { chatsRouter } = require('./routers/chatsRouter.js');
const { messagesRouter } = require('./routers/messagesRouter.js');
const { socketController } = require('./controllers/socketController.js');
const { handleErrorsMW } = require('./middlewares/handleErrorsMW.js');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use(userRouter);
app.use('/chats', chatsRouter);
app.use('/messages', messagesRouter);

app.use(handleErrorsMW);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running...');
});

socketController(server);
