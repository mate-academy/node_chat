import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './data-source';
import { Message } from './entities/Message';
import { Room } from './entities/Room';
import { User } from './entities/User';
import { isUuid } from './utils/http';
import { setIo } from './events';

const MAX_MESSAGE_LENGTH = 1000;

type Ack = (response: { ok: boolean; error?: string }) => void;

interface SendMessagePayload {
  roomId?: unknown;
  username?: unknown;
  text?: unknown;
}

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  setIo(io);

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join_room', (roomId: unknown) => {
      if (typeof roomId === 'string' && isUuid(roomId)) {
        socket.join(roomId);
      }
    });

    socket.on('leave_room', (roomId: unknown) => {
      if (typeof roomId === 'string') {
        socket.leave(roomId);
      }
    });

    socket.on(
      'send_message',
      async (payload: SendMessagePayload, ack?: Ack) => {
        const reply = (response: { ok: boolean; error?: string }) => {
          if (typeof ack === 'function') {
            ack(response);
          }
        };

        try {
          const roomId = String(payload?.roomId ?? '');
          const username = String(payload?.username ?? '').trim();
          const text = String(payload?.text ?? '').trim();

          if (text.length < 1 || text.length > MAX_MESSAGE_LENGTH) {
            reply({
              ok: false,
              error: `Message must be 1-${MAX_MESSAGE_LENGTH} characters`,
            });
            return;
          }

          const room = isUuid(roomId)
            ? await AppDataSource.getRepository(Room).findOneBy({ id: roomId })
            : null;

          if (!room) {
            reply({ ok: false, error: 'Room not found' });
            return;
          }

          const author = await AppDataSource.getRepository(User).findOneBy({
            username,
          });

          if (!author) {
            reply({ ok: false, error: 'User not found' });
            return;
          }

          const messages = AppDataSource.getRepository(Message);
          const message = await messages.save(
            messages.create({ text, author, room }),
          );

          io.to(room.id).emit('new_message', {
            id: message.id,
            text: message.text,
            createdAt: message.createdAt,
            author: author.username,
            roomId: room.id,
          });

          reply({ ok: true });
        } catch (error) {
          console.error(error);
          reply({ ok: false, error: 'Failed to send message' });
        }
      },
    );

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};
