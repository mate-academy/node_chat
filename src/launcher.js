'use strict';

// db.js підвантажує .env, тому require('./db') має бути першим
const { sequelize } = require('./db');
const { createServer } = require('./index');

const PORT = process.env.PORT || 3000;

sequelize
  .sync() // створює таблицю цю
  .then(() => {
    createServer().listen(PORT, () => {});
  })
  /*eslint-disable*/
  .catch((error) => {
    process.exit(1); // закінчення з кодом помилки
  });
