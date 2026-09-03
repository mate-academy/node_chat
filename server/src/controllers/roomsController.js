'use strict';

const roomsService = require('../services/roomsService');

async function getRooms(req, res) {
  const rooms = await roomsService.listRooms();

  res.json(rooms);
}

async function createRoom(req, res) {
  const name = String(req.body.name || '').trim();

  if (!name) {
    res.status(400).json({ message: 'Room name is required' });

    return;
  }

  const room = await roomsService.createRoom(name);

  res.status(201).json(room);
}

async function renameRoom(req, res) {
  const newName = String(req.body.name || '').trim();

  if (!newName) {
    res.status(400).json({ message: 'New room name is required' });

    return;
  }

  const room = await roomsService.renameRoom(req.params.id, newName);

  res.json(room);
}

async function deleteRoom(req, res) {
  await roomsService.deleteRoom(req.params.id);

  res.status(204).end();
}

module.exports = {
  getRooms,
  createRoom,
  renameRoom,
  deleteRoom,
};
