const express = require('express');

const { messagesRouter } = require('./routes/messages.route.js');
const { groupsRouter } = require('./routes/groups.route.js');

const app = express();

app.use(express.json());

app.use('/message', messagesRouter);
app.use('/group', groupsRouter);

app.listen(3005);
