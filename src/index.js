'use strict';

const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;
const app = createApp();

if (require.main === module) {
  app.listen(port, () => {
    process.stdout.write(`Relay chat listening at http://localhost:${port}\n`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
module.exports.createChatServer = createApp;
