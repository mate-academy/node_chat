const createMessageHandler = require('./handlers/createMessageHandler');
const deleteMessageHandler = require('./handlers/deleteMessageHandler');
const updateMessageHandler = require('./handlers/updateMessageHandler');

const eventHandlers = {
  'message/create': createMessageHandler,
  'message/delete': deleteMessageHandler,
  'message/update': updateMessageHandler,
};

module.exports = eventHandlers;
