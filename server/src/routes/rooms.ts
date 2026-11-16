import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Room } from '../entities/Room';
import { asyncHandler, isUniqueViolation, isUuid } from '../utils/http';
import { Message } from '../entities/Message';

export const roomsRouter = Router();

const roomsRepo = () => AppDataSource.getRepository(Room);

const parseName = (value: unknown): string | null => {
  const name = String(value ?? '').trim();

  return name.length >= 1 && name.length <= 100 ? name : null;
};

// GET /rooms -> all rooms, oldest first
roomsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rooms = await roomsRepo().find({ order: { createdAt: 'ASC' } });

    res.json(rooms);
  }),
);

// POST /rooms  { "name": "general" } -> creates a room
roomsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = parseName(req.body?.name);

    if (!name) {
      res.status(400).json({ error: 'Room name must be 1-100 characters' });
      return;
    }

    try {
      const room = await roomsRepo().save(roomsRepo().create({ name }));

      res.status(201).json(room);
    } catch (error) {
      if (isUniqueViolation(error)) {
        res.status(409).json({ error: 'Room name is already taken' });
        return;
      }
      throw error;
    }
  }),
);

// PATCH /rooms/:id  { "name": "new name" } -> renames a room
roomsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const name = parseName(req.body?.name);

    if (!name) {
      res.status(400).json({ error: 'Room name must be 1-100 characters' });
      return;
    }

    const room = isUuid(id) ? await roomsRepo().findOneBy({ id }) : null;

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    room.name = name;

    try {
      res.json(await roomsRepo().save(room));
    } catch (error) {
      if (isUniqueViolation(error)) {
        res.status(409).json({ error: 'Room name is already taken' });
        return;
      }
      throw error;
    }
  }),
);

// DELETE /rooms/:id -> deletes a room (its messages are deleted by the DB)
roomsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const result = isUuid(id) ? await roomsRepo().delete({ id }) : null;

    if (!result || !result.affected) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.status(204).send();
  }),
);

// GET /rooms/:id/messages -> full history of a room, oldest first
roomsRouter.get(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const room = isUuid(id) ? await roomsRepo().findOneBy({ id }) : null;

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const messages = await AppDataSource.getRepository(Message).find({
      where: { room: { id } },
      order: { createdAt: 'ASC' },
    });

    res.json(
      messages.map((message) => ({
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        author: message.author.username,
      })),
    );
  }),
);
