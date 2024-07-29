/* eslint-disable no-console */
const { roomService } = require('../service/room.service');
const WebSocket = require('ws');
const wss = require('../websocket/websocket');

const create = async (req, res) => {
  const { name, userId } = req.body;

  if (!name || !userId) {
    return res.status(400).send('Room name and user ID are required');
  }

  try {
    const room = await roomService.create(name, userId);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'newRoom', data: room }));
      }
    });

    res.status(201).send(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).send('Server error');
  }
};

const getAll = async (req, res) => {
  try {
    const rooms = await roomService.getAll();

    res.status(200).send(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).send('Server error');
  }
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('Room ID is required');
  }

  try {
    await roomService.deleteRoom(id);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'deleteRoom', data: { id } }));
      }
    });

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).send('Server error');
  }
};

const renameRoom = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id || !name) {
    return res.status(400).send('Room ID and new name are required');
  }

  try {
    await roomService.renameRoom(id, name);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'renameRoom', data: { id, name } }));
      }
    });

    res.sendStatus(204);
  } catch (error) {
    console.error('Error renaming room:', error);
    res.status(500).send('Server error');
  }
};

const roomController = {
  create,
  getAll,
  deleteRoom,
  renameRoom,
};

module.exports = {
  roomController,
};
