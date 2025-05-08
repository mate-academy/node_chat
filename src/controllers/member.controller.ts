import { Request, Response } from 'express';
import { memberService } from '../services/member.service';

import { ResponseBody } from '../types/ResponseBody';
import { RoomIdSchema } from '../schemas/roomId.schema';
import { NormalizedUser } from '../types/NormalizedUser';

class MemberController {
  join = async (
    req: Request<RoomIdSchema>,
    res: Response<ResponseBody<NormalizedUser>>,
  ) => {
    const { roomId } = req.params;
    const { id: userId } = req.user!;
    const normalizedRoom = await memberService.join(roomId, userId);

    res.status(200).json({
      message: 'OK',
      data: normalizedRoom,
    });
  };

  leave = async (req: Request<RoomIdSchema>, res: Response<void>) => {
    const { roomId } = req.params;
    const { id: userId } = req.user!;

    await memberService.leave(roomId, userId);
    res.sendStatus(204);
  };
}

export const memberController = new MemberController();
