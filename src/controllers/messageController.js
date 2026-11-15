import { chatStore } from '../models/chatStore.js';

export function createMessage(req, res) {
  const { text, roomId, userName } = req.body;

  if (!text || !roomId || !userName) {
    res.sendStatus(400);

    return;
  }

  res.status(201).send(chatStore.addMessage(text, roomId, userName));
}

export function getMessages(req, res) {
  const { roomId } = req.query;

  if (!roomId) {
    res.sendStatus(400);

    return;
  }

  res.send(chatStore.getMessages(roomId));
}
