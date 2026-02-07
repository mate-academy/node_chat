import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1).max(32),
});

export const createRoomSchema = z.object({
  name: z.string().min(1).max(64),
});

export const joinRoomSchema = z.object({
  roomId: z.string().min(1),
});

export const renameRoomSchema = z.object({
  roomId: z.string().min(1),
  name: z.string().min(1).max(64),
});

export const deleteRoomSchema = z.object({
  roomId: z.string().min(1),
});

export const messageSchema = z.object({
  text: z.string().min(1).max(2000),
});

export const clientMessageSchema = z.object({
  type: z.enum([
    'login',
    'createRoom',
    'joinRoom',
    'leaveRoom',
    'renameRoom',
    'deleteRoom',
    'message',
  ]),
  payload: z.unknown(),
});
