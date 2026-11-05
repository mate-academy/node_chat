'use strict'; // db.js підвантажує .env, тому require('./db') має бути першим

const _require = require('./db');
const sequelize = _require.sequelize;

const _require2 = require('./index');
const createServer = _require2.createServer;

const PORT = process.env.PORT || 3000;

sequelize
  .sync() // створює таблицю цю
  .then(function () {
    createServer().listen(PORT, function () {});
  })
  [
    /*eslint-disable*/
    'catch'
  ](function (error) {
    process.exit(1); // закінчення з кодом помилки
  });
