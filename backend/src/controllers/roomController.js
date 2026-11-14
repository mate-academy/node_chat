import { chatStore } from '../models/chatStore.js';

export function getRooms(req, res) {
  res.send(chatStore.getRooms());
}

export function getRoom(req, res) {
  const room = chatStore.getRoom(req.params.id);

  if (!room) {
    res.sendStatus(404);

    return;
  }

  res.send(room);
}

export function createRoom(req, res) {
  const { userName, name } = req.body;

  if (!userName || !name) {
    res.sendStatus(404);

    return;
  }

  res.send(chatStore.createRoom(name, userName));
}

export function renameRoom(req, res) {
  const { id } = req.params;
  const { userName, name } = req.body || {};

  if (!userName || !name || !id) {
    res.sendStatus(400);

    return;
  }

  const result = chatStore.renameRoom(id, name, userName);

  if (result.status === 'not-found') {
    res.sendStatus(404);

    return;
  }

  if (result.status === 'forbidden') {
    res.sendStatus(403);

    return;
  }

  res.sendStatus(200);
}

export function deleteRoom(req, res) {
  const result = chatStore.deleteRoom(req.params.id, req.body?.userName);

  if (result.status === 'not-found') {
    res.sendStatus(404);

    return;
  }

  if (result.status === 'forbidden') {
    res.sendStatus(403);

    return;
  }

  res.sendStatus(204);
}
