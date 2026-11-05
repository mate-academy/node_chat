'use strict';

const _require = require('events');
const EventEmitter = _require.EventEmitter;

const emitter = new EventEmitter();

module.exports = {
  emitter: emitter,
};
