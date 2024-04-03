'use strict';

class SocketManager {
  constructor() {
    this.connections = new Map();
  }

  isOnline(userName) {
    return this.connections.has(userName);
  }

  create(userName, socket) {
    this.connections.set(userName, socket);
  }

  remove(userName) {
    this.connections.delete(userName);
  }

  removeBySocket(ws) {
    for (const [userName, socket] of this.connections.entries()) {
      if (socket === ws) {
        this.connections.delete(userName);
        break;
      }
    }
  }

  sendToUsers(userNames, message) {
    const messageInString = JSON.stringify(message);

    for (const name of userNames) {
      const socket = this.connections.get(name);

      if (socket) {
        socket.send(messageInString);
      }
    }
  }
}

const sockets = new SocketManager();

module.exports = { sockets };
