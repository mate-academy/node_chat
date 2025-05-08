import { Request, RequestHandler, Response } from 'express';

import { db } from '../utils/db';
import { roomService } from '../services/room.service';
import { memberService } from '../services/member.service';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

import { NameSchema } from '../schemas/name.schema';
import { RoomIdSchema } from '../schemas/roomId.schema';

import { RoomPreview } from '../types/RoomPreview';
import { ResponseBody } from '../types/ResponseBody';
import { RoomWithRole } from '../types/RoomWithRole';

class RoomController {
  getSummary = async (
    req: Request,
    res: Response<ResponseBody<RoomPreview[]>>,
  ) => {
    const { id: userId } = req.user!;
    const preview = await roomService.getSummary(userId);

    res.json({
      message: 'OK',
      data: preview,
    });
  };

  getWithRole = async (
    req: Request<RoomIdSchema>,
    res: Response<ResponseBody<RoomWithRole>>,
  ) => {
    const { id: userId } = req.user!;
    const { roomId: id } = req.params;

    const roomWithRole = await roomService.getWithRole(id, userId);

    res.json({
      message: 'OK',
      data: roomWithRole,
    });
  };

  create = async (
    req: Request<{}, {}, NameSchema>,
    res: Response<ResponseBody<RoomPreview>>,
  ) => {
    const { name } = req.body;
    const { id: userId } = req.user!;

    const preview = await db.$transaction(
      async (tx: PrismaTransactionClient): Promise<RoomPreview> => {
        const preview = await roomService.create(name, userId, tx);
        await memberService.create(preview.id, userId, tx);

        return preview;
      },
    );

    res.status(201).json({
      message: 'OK',
      data: preview,
    });
  };

  delete = async (req: Request<RoomIdSchema>, res: Response<void>) => {
    const { id: userId } = req.user!;
    const { roomId: id } = req.params;

    await roomService.delete(id, userId);
    res.sendStatus(204);
  };

  changeName = async (
    req: Request<RoomIdSchema, {}, NameSchema>,
    res: Response<ResponseBody<RoomWithRole>>,
  ) => {
    const { name } = req.body;
    const { id: userId } = req.user!;
    const { roomId: id } = req.params;

    const roomWithRole = await roomService.changeName(id, userId, name);

    res.json({
      message: 'OK',
      data: roomWithRole,
    });
  };
}

export const roomController = new RoomController();
