'use strict';

import type { Request as ExpressRequest, Response, NextFunction } from 'express';
import type { IRoom } from '../models/room';
import type { IUser } from '../models/user';
import Room from '../models/room';
import {
  NOT_FOUND,
  CREATED,
  OK,
  NO_CONTENT,
} from '../constants/httpStatusCodes';
import {
  ROOM_NOT_FOUND,
} from '../constants/errorMessages';

interface Request extends ExpressRequest {
  user: IUser;
}

const checkRoomExists = (room: IRoom, res: Response) => {
  if (!room) {
    return res.status(NOT_FOUND).json({ message: ROOM_NOT_FOUND });
  }
};

export const createRoom = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const room = await Room.create({ name });

    res.status(CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

export const getRooms = async(_: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find({});

    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};

export const removeRoom = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findByIdAndRemove(req.params.id);

    checkRoomExists(room, res);

    res.status(NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

export const renameRoom = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    checkRoomExists(room, res);

    res.status(OK).json(room);
  } catch (err) {
    next(err);
  }
};

export const joinRoom = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findById(req.params.id);

    checkRoomExists(room, res);

    // Add the user to the room's members array
    room.members.push(req.user._id);
    await room.save();

    res.status(OK).json(room);
  } catch (err) {
    next(err);
  }
};
