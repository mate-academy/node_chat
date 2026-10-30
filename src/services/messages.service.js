const { randomBytes } = require('crypto');
const config = require('../config');
const repo = require('../repositories/rooms.repository');
const realtime = require('./realtime.service');
const roomsService = require('./rooms.service');
const { httpError } = require('../utils/errors');
const { cleanText } = require('../utils/validators');

function send(roomId, rawAuthor, rawText) {
  const room = roomsService.getOrFail(roomId);

  const author = cleanText(rawAuthor, config.limits.username);

  if (!author) {
    throw httpError(
      400,
      'Defina um nome de usuário antes de enviar mensagens.',
    );
  }

  const text = typeof rawText === 'string' ? rawText.trim() : '';

  if (!text || text.length > config.limits.text) {
    throw httpError(
      400,
      'A mensagem deve ter de 1 a ' + config.limits.text + ' caracteres.',
    );
  }

  const message = repo.appendMessage(room, {
    id: randomBytes(8).toString('hex'),
    author,
    text,
    ts: Date.now(),
  });

  realtime.broadcast('message', { roomId: room.id, message });

  return message;
}

module.exports = { send };
