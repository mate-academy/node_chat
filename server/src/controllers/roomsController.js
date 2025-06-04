import { messageEmitter } from '../events/messageEmitter.js';
import { roomsEmitter } from '../events/roomsEmitter.js';
import { roomsService } from '../service/roomsService.js';
import { usersService } from '../service/usersService.js';

const roomsMethods = ['rename', 'delete', 'deleteUser'];

async function createNew(req, res) {
  const { user, name, limit } = req.body;

  if (!user || !name || !limit) {
    console.log(`==================REQUEST CREATE ERROR==============`);
    res.status(400).json('Invalid data request');

    return;
  }

  if (Number(limit) > 10 || Number(limit) < 2) {
    return res.status(400).json('Invalid limit. Max count: 10 | Min count: 2');
  }

  try {
    const response = await roomsService.create(user, name, limit);

    if (!response) {
      return res.status(500).json('Connot create');
    }

    return res.status(201).json(response);
  } catch (err) {
    console.error(`catch error createnew room controller: ${err.message}`);
    res.status(500).json('Server error');
  }
}

async function joinRoom(req, res) {
  const roomId = req.params.roomId;
  const user = req.body.user;

  if (!roomId || !user) {
    return res.status(400).json('Invalid request data');
  }

  try {
    const response = await roomsService.join(roomId, user);

    switch (response) {
      case undefined:
        return res.status(404).json('Room not found');

      case false:
        return res.status(407).json('This room have max count of users');

      default:
        roomsEmitter.emit('changed', response);
        return res.status(201).json(response);
    }
  } catch (err) {
    console.error(`catch error join room controller: ${err.message}`);

    return res.status(500).json('Server error');
  }
}

async function change(req, res) {
  const { roomId, user, method } = req.body;

  if (!roomId || !user || !roomsMethods.includes(method.type)) {
    return res.status(400).json('Invalid data request');
  }

  const currentRoom = await roomsService.getById(roomId);

  if (!currentRoom) {
    return res.status(404).json('Room not found');
  }

  if (!(currentRoom.admin !== user)) {
    return res.status(407).json('Access denied');
  }

  try {
    const changedRoom = await roomsService.change(roomId, method);

    if (!changedRoom) {
      throw new Error(changedRoom);
    }

    switch (method.type) {
      case 'rename':
        roomsEmitter.emit('changed', changedRoom[0]);

        return res.sendStatus(201);
      case 'delete':
        roomsEmitter.emit('deleted', roomId);

        return res.sendStatus(204);
      case 'deleteUser':
        roomsEmitter.emit('changed', changedRoom);
    }
  } catch (err) {
    console.error(`catch error change controller: ${err.message}`);

    return res.status(500).json('Server error');
  }
}

async function crearAll(req, res) {
  await roomsService.crear();

  res.sendStatus(204);
}

export const roomsController = {
  createNew,
  joinRoom,
  crearAll,
  change,
};
