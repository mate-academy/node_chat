const { randomBytes } = require('crypto');
const config = require('../config');
const repo = require('../repositories/rooms.repository');
const realtime = require('./realtime.service');
const { httpError } = require('../utils/errors');
const { cleanText } = require('../utils/validators');

const toPublic = (room) => ({ id: room.id, name: room.name });

function list() {
  return repo.findAll().map(toPublic);
}

function getOrFail(id) {
  const room = repo.findById(id);

  if (!room) {
    throw httpError(404, 'Sala não encontrada.');
  }

  return room;
}

function validateName(value, exceptId) {
  const name = cleanText(value, config.limits.roomName);

  if (!name) {
    throw httpError(
      400,
      'O nome da sala deve ter de 1 a ' +
        config.limits.roomName +
        ' caracteres.',
    );
  }

  if (repo.nameExists(name, exceptId)) {
    throw httpError(409, 'Já existe uma sala com esse nome.');
  }

  return name;
}

const notifyRoomsChanged = () => realtime.broadcast('rooms', { rooms: list() });

function create(rawName) {
  const name = validateName(rawName);
  const room = repo.createRoom({
    id: randomBytes(6).toString('hex'),
    name,
    messages: [],
  });

  notifyRoomsChanged();

  return toPublic(room);
}

function rename(id, rawName) {
  const room = getOrFail(id);

  repo.renameRoom(room, validateName(rawName, room.id));
  notifyRoomsChanged();

  return toPublic(room);
}

function remove(id) {
  const room = getOrFail(id);

  if (repo.count() === 1) {
    throw httpError(400, 'Não é possível excluir a única sala.');
  }
  repo.deleteRoom(room.id);
  notifyRoomsChanged();
}

function history(id) {
  const room = getOrFail(id);

  return { room: toPublic(room), messages: room.messages };
}

module.exports = {
  list,
  getOrFail,
  create,
  rename,
  remove,
  history,
};
