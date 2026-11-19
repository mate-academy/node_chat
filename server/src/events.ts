import { Server } from 'socket.io';

let io: Server | null = null;

export const setIo = (instance: Server) => {
  io = instance;
};

// Sends an event to every connected client
export const broadcast = (event: string, payload: unknown) => {
  io?.emit(event, payload);
};
