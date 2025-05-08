import { Request, Response } from 'express';
import { messageService } from '../services/message.service';

import { TextSchema } from '../schemas/text.schema';
import { RoomIdSchema } from '../schemas/roomId.schema';

import { ResponseBody } from '../types/ResponseBody';
import { NormalizedUser } from '../types/NormalizedUser';
import { MessagePreview } from '../types/MessagePreview';

class MessageController {
  getAll = async (
    req: Request<RoomIdSchema>,
    res: Response<ResponseBody<MessagePreview[]>>,
  ) => {
    const { roomId } = req.params;
    const { id: userId } = req.user!;
    const previews = await messageService.getAll(roomId, userId);

    res.json({ message: 'OK', data: previews });
  };

  create = async (
    req: Request<RoomIdSchema, {}, TextSchema>,
    res: Response<ResponseBody<MessagePreview>>,
  ) => {
    const { text } = req.body;
    const { roomId } = req.params;
    const { id: authorId } = req.user!;

    const preview = await messageService.create(roomId, authorId, text);

    res.status(201).json({ message: 'OK', data: preview });
  };
}

export const messageController = new MessageController();
