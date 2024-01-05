import type { Request, Response, NextFunction } from 'express';
import type { IChat } from '../models/chat';
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
import * as roomService from '../services/room';
import * as chatService from '../services/chat';

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

    const roomObj = await roomService.findRoomById(room);

    if (!roomObj.members.includes(sender)) {
      return res.status(FORBIDDEN).json({
        message: MUST_JOIN_ROOM,
      });
    }

    const chat = await chatService.createChat(message, sender, room);

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
    const chats = await chatService.findChatsByRoom(room);

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

    const chat = await chatService.updateChatById(req.params.id, message);

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
    const chat = await chatService.removeChatById(req.params.id);

    checkChatExists(chat, res);

    res.status(NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};
