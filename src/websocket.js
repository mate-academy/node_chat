const { EventEmitter } = require('events');

const websocketEmitter = new EventEmitter();

module.exports = {
  websocketEmitter,
};
