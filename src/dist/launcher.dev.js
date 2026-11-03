'use strict'; // db.js підвантажує .env, тому require('./db') має бути першим

var _require = require('./db'),
    sequelize = _require.sequelize;

var _require2 = require('./index'),
    createServer = _require2.createServer;

var PORT = process.env.PORT || 3000;
sequelize.sync() // створює таблицю цю
.then(function () {
  createServer().listen(PORT, function () {});
})
/*eslint-disable*/
["catch"](function (error) {
  process.exit(1); // закінчення з кодом помилки
});