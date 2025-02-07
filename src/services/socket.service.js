import { Server } from 'socket.io';

export default class SocketService {
  static instance;
  io;

  constructor(server) {
    this.io = new Server(server, {
      transports: ['websocket'],
    });
  }

  static getInstance(server) {
    if (!SocketService.instance && server) {
      SocketService.instance = new SocketService(server);
    }

    return SocketService.instance;
  }

  getSocket() {
    return this.io;
  }
}
