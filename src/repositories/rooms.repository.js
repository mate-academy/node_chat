/**
 * Camada de dados: guarda salas e mensagens em memória
 * e persiste em um arquivo JSON.
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

let rooms = [];
let saveTimer = null;

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(config.DATA_FILE, 'utf8'));

    if (Array.isArray(parsed.rooms) && parsed.rooms.length) {
      rooms = parsed.rooms;

      return;
    }
  } catch (_) {
    /* arquivo inexistente ou inválido: começa do zero */
  }
  rooms = [{ id: 'geral', name: 'Geral', messages: [] }];
}

function save() {
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    const tmp = config.DATA_FILE + '.tmp';

    fs.mkdir(path.dirname(config.DATA_FILE), { recursive: true }, (e0) => {
      if (e0) {
        return logger.error('Falha ao salvar:', e0.message);
      }

      fs.writeFile(tmp, JSON.stringify({ rooms }), (e1) => {
        if (e1) {
          return logger.error('Falha ao salvar:', e1.message);
        }

        fs.rename(tmp, config.DATA_FILE, (e2) => {
          if (e2) {
            logger.error('Falha ao salvar:', e2.message);
          }
        });
      });
    });
  }, 200);
}

const findAll = () => rooms;
const findById = (id) => rooms.find((r) => r.id === id);
const count = () => rooms.length;

const nameExists = (name, exceptId) =>
  rooms.some(
    (r) => r.id !== exceptId && r.name.toLowerCase() === name.toLowerCase(),
  );

function createRoom(room) {
  rooms.push(room);
  save();

  return room;
}

function renameRoom(room, name) {
  room.name = name;
  save();

  return room;
}

function deleteRoom(id) {
  rooms = rooms.filter((r) => r.id !== id);
  save();
}

function appendMessage(room, message) {
  room.messages.push(message);

  if (room.messages.length > config.limits.messagesPerRoom) {
    room.messages.shift();
  }
  save();

  return message;
}

module.exports = {
  load,
  findAll,
  findById,
  count,
  nameExists,
  createRoom,
  renameRoom,
  deleteRoom,
  appendMessage,
};
