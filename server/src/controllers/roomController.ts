import { Request, Response } from 'express';
import { rooms } from '../models/store.js';

export function getAll(_req: Request, res: Response): void {
  const list = Object.entries(rooms).map(([id, room]) => ({ id, name: room.name }));
  res.status(200).send(list);
}

export function create(req: Request, res: Response): void {
  const { name } = req.body;
  const id = name.toLowerCase().replace(/\s+/g, '-');
  rooms[id] = { name, messages: [] };
  res.status(201).send({ id, name });
}

export function rename(req: Request, res: Response): void {
  const { id } = req.params;
  const { name } = req.body;
  if (!rooms[id]) {
    res.status(404).send({ error: 'Room not found' });
    return;
  }
  rooms[id].name = name;
  res.status(200).send({ id, name });
}

export function remove(req: Request, res: Response): void {
  const { id } = req.params;
  if (!rooms[id]) {
    res.status(404).send({ error: 'Room not found' });
    return;
  }
  delete rooms[id];
  res.status(204).send();
}

export function getMessages(req: Request, res: Response): void {
  const { id } = req.params;
  if (!rooms[id]) {
    res.status(404).send({ error: 'Room not found' });
    return;
  }
  res.status(200).send(rooms[id].messages);
}
