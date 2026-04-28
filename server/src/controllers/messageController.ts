import { Request, Response } from 'express';
import { rooms, emitter } from '../models/store.js';
import type { Message } from '../models/types.js';

export function create(req: Request, res: Response): void {
  const { roomId, text, username } = req.body;
  if (!rooms[roomId]) {
    res.status(404).send({ error: 'Room not found' });
    return;
  }
  const message: Message = { username, text, time: new Date(), roomId };
  rooms[roomId].messages.push(message);
  emitter.emit('message', message);
  res.status(201).send(rooms[roomId].messages);
}
