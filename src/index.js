'use strict';

const app = require('./app');

const DEFAULT_PORT = 5000;
const requestedPort = Number(process.env.PORT);
const port =
  Number.isInteger(requestedPort) && requestedPort > 0
    ? requestedPort
    : DEFAULT_PORT;

app.listen(port, () => {
  process.stdout.write(`Chat server is running on http://localhost:${port}\n`);
});
