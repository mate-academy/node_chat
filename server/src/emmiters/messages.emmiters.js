const { EventEmitter } = require('events');

const messageEmitter = new EventEmitter();

module.exports = { messageEmitter };
