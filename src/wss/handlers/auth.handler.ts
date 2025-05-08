import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';

import { tokenSchema } from '../../schemas/token.schema';
import { roomIdSchema } from '../../schemas/roomId.schema';

import { jwt } from '../../utils/jwt';
import { WssError } from '../../exceptions/wss.error';
import { ApiError } from '../../exceptions/api.error';

import { roomService } from '../../services/room.service';

const authSchema = tokenSchema.access.merge(roomIdSchema);

export async function authHandler(
  _ws: WebSocket,
  req: IncomingMessage,
): Promise<{ roomId: string; userId: string }> {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const result = authSchema.safeParse(searchParams);

  if (!result.success) {
    throw WssError.unsupported('Invalid auth params');
  }

  const { accessToken, roomId } = result.data;
  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    throw WssError.unauthorized('Invalid token');
  }

  try {
    await roomService.getWithRole(roomId, userData.id);
    return { roomId, userId: userData.id };
  } catch (err) {
    if (err instanceof ApiError) {
      switch (err.status) {
        case 404:
          throw WssError.notFound('Room not found');
        case 403:
          throw WssError.forbidden('Access denied to the room');
        case 409:
      }
    }

    throw err;
  }
}
