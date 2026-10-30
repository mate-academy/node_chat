const roomsService = require('../services/rooms.service');
const messagesService = require('../services/messages.service');
const { readJSON, sendJSON } = require('../utils/http');

async function history({ res, params }) {
  sendJSON(res, 200, roomsService.history(params[0]));
}

async function send({ req, res, params }) {
  const body = await readJSON(req);
  const message = messagesService.send(params[0], body.author, body.text);

  sendJSON(res, 201, { message });
}

module.exports = { history, send };
