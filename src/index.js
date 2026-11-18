'use strict';

const app = require('./app');
const initSocket = require('./socket');

const PORT = process.env.PORT || 3005;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server runs on http://localhost:3005');
});

initSocket(server);
