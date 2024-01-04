import type { Request, Response, NextFunction } from 'express';
import type { IChat } from '../models/chat';
import Chat from '../models/chat';
import Room from '../models/room';
import {
  NOT_FOUND,
  FORBIDDEN,
  CREATED,
  OK,
  NO_CONTENT,
} from '../constants/httpStatusCodes';
import {
  MESSAGE_NOT_FOUND,
  MUST_JOIN_ROOM,
} from '../constants/errorMessages';

const checkChatExists = (chat: IChat, res: Response) => {
  if (!chat) {
    return res.status(NOT_FOUND).json({ message: MESSAGE_NOT_FOUND });
  }
};

export const createMessage = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { message, sender, room } = req.body;

    const roomObj = await Room.findById(room);

    if (!roomObj.members.includes(sender)) {
      return res.status(FORBIDDEN).json({
        message: MUST_JOIN_ROOM,
      });
    }

    const chat = await Chat.create({
      message,
      sender,
      room,
    });

    res.status(CREATED).json(chat);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const room = req.params.room || null;
    const chats = await Chat.find({ room }).populate('sender');

    res.status(OK).json(chats);
  } catch (err) {
    next(err);
  }
};

export const editMessage = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { message } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { message },
      { new: true },
    );

    checkChatExists(chat, res);

    res.status(OK).json(chat);
  } catch (err) {
    next(err);
  }
};

export const removeMessage = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const chat = await Chat.findByIdAndRemove(req.params.id);

    checkChatExists(chat, res);

    res.status(NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};
