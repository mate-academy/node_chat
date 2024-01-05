import type {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from 'express';
import type { IRoom } from '../models/room';
import type { IUser } from '../models/user';
import {
  NOT_FOUND,
  CREATED,
  OK,
  NO_CONTENT,
} from '../constants/httpStatusCodes';
import {
  ROOM_NOT_FOUND,
} from '../constants/errorMessages';
import * as roomService from '../services/room';

interface Request extends ExpressRequest {
  user: IUser;
}

const checkRoomExists = (room: IRoom, res: Response) => {
  if (!room) {
    return res.status(NOT_FOUND).json({ message: ROOM_NOT_FOUND });
  }
};

export const createRoom = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;

    const room = await roomService.createRoom(name);

    res.status(CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

export const getRooms = async(
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rooms = await roomService.findAllRooms();

    res.status(OK).json(rooms);
  } catch (err) {
    next(err);
  }
};

export const removeRoom = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const room = await roomService.removeRoomById(req.params.id);

    checkRoomExists(room, res);

    res.status(NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

export const renameRoom = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;

    const room = await roomService.updateRoomById(req.params.id, name);

    checkRoomExists(room, res);

    res.status(OK).json(room);
  } catch (err) {
    next(err);
  }
};

export const joinRoom = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const room = await roomService.findRoomById(req.params.id);

    checkRoomExists(room, res);

    const updatedRoom = await roomService.addMemberToRoom(room, req.user._id);

    res.status(OK).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};
