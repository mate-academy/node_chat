const { EventEmitter } = require('events');

const messagesEmitter = new EventEmitter();

module.exports = {
  messagesEmitter,
};
