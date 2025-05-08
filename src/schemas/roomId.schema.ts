import { z } from 'zod';

export const roomIdSchema = z.object({
  roomId: z.string().uuid('Invalid roomId'),
});

export type RoomIdSchema = z.infer<typeof roomIdSchema>;
