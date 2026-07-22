import { randomUUID } from 'node:crypto';
import { rooms, users } from '../store/store.js';
import type { Room, User } from '../utils/types/types.js';
import express, { Router, type Request, type Response } from 'express';
import EventEmitter from 'node:events';
import { authMiddleware } from '../middleware/auth.middleware.js';

interface RoomEvents {
  createRoom: [newRoom: Room];
  updateRoom: [updatedRoom: Room];
  deleteRoom: [deletedRoom: Room];
  addMember: [updatedRoom: Room];
  deleteMember: [userId: string, updatedRoom: Room];
}

export const roomRouter: Router = express.Router();

export const roomEmitter = new EventEmitter<RoomEvents>();

roomRouter.post(
  '',
  authMiddleware,
  (req: Request<{}, { name: string; ownerId: string }>, res: Response) => {
    const { ownerId, name } = req.body;

    if (!ownerId || !name) {
      return res.sendStatus(400);
    }

    const owner = users.find((user) => user.id === ownerId);

    if (!owner) {
      return res.sendStatus(400);
    }

    const newRoom: Room = {
      id: randomUUID().toString(),
      ownerId: owner.id,
      name,
      usersId: [],
    };

    rooms.push(newRoom);

    roomEmitter.emit('createRoom', newRoom);
    res.send(newRoom);
  },
);

roomRouter.patch(
  '',
  authMiddleware,
  (req: Request<{}, { id: string; name: string }>, res: Response) => {
    const { id, name } = req.body;

    if (!id || !name) {
      return res.sendStatus(400);
    }

    const foundRoom = rooms.find((item) => item.id === id);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    foundRoom.name = name;

    roomEmitter.emit('updateRoom', foundRoom);

    res.send(foundRoom);
  },
);

roomRouter.patch(
  '/addMember',
  authMiddleware,
  (req: Request<{}, { id: string; userId: string }>, res: Response) => {
    const { id, userId } = req.body;

    if (!id || !userId) {
      return res.sendStatus(400);
    }

    const foundRoom = rooms.find((item) => item.id === id);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    if (foundRoom.ownerId !== res.locals.user.id) {
      return res.sendStatus(400);
    }

    foundRoom.usersId.push(userId);

    roomEmitter.emit('addMember', foundRoom);

    res.send(foundRoom);
  },
);

roomRouter.patch(
  '/deleteMember',
  authMiddleware,
  (req: Request<{}, { id: string; userId: string }>, res: Response) => {
    const { id, userId } = req.body;

    if (!id || !userId) {
      return res.sendStatus(400);
    }

    const foundRoom = rooms.find((item) => item.id === id);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    if (foundRoom.ownerId !== res.locals.user.id) {
      return res.sendStatus(400);
    }

    foundRoom.usersId = foundRoom.usersId.filter(
      (filterId) => filterId !== userId,
    );

    roomEmitter.emit('deleteMember', userId, foundRoom);

    res.send(foundRoom);
  },
);

roomRouter.get(
  '',
  authMiddleware,
  (req: Request<{}, {}, {}, {}>, res: Response<{}, { user: User }>) => {
    const UserId = res.locals.user.id;

    if (!UserId) {
      return res.sendStatus(400);
    }

    const filteredRooms = rooms.filter(
      (room) =>
        room.usersId.some((id) => id === UserId) || room.ownerId === UserId,
    );

    res.send(filteredRooms);
  },
);

roomRouter.get(
  '/:roomId',
  authMiddleware,
  (
    req: Request<{ roomId: string }, {}, {}, {}>,
    res: Response<{}, { user: User }>,
  ) => {
    const { roomId } = req.params;

    const userId = res.locals.user.id;

    if (!roomId) {
      return res.sendStatus(400);
    }

    const foundRoom = rooms.find((item) => item.id === roomId);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    const accessInRoom =
      foundRoom.usersId.some((id) => id === userId) ||
      foundRoom.ownerId === userId;

    if (!accessInRoom) {
      return res.sendStatus(401);
    }

    res.send(foundRoom);
  },
);

roomRouter.delete(
  '/:roomId',
  authMiddleware,
  (
    req: Request<{ roomId: string }, {}, {}, {}>,
    res: Response<{}, { user: User }>,
  ) => {
    const { roomId } = req.params;

    const userId = res.locals.user.id;

    if (!roomId) {
      return res.sendStatus(400);
    }

    const foundRoom = rooms.find((item) => item.id === roomId);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    const accessInRoom = foundRoom.ownerId === userId;

    if (!accessInRoom) {
      return res.sendStatus(401);
    }

    const index = rooms.findIndex((item) => item.id === roomId);

    const deletedRoom = rooms.splice(index, 1);

    if (deletedRoom[0]) {
      roomEmitter.emit('deleteRoom', deletedRoom[0]);
    }
    res.sendStatus(200);
  },
);
