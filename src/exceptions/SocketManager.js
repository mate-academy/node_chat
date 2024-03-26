'use strict';

class SocketManager {
  constructor() {
    this.connections = new Map();
  }

  isOnline(userName) {
    return this.connections.has(userName);
  }

  getLength() {
    return this.connections.size;
  }

  create(userName, socket) {
    // eslint-disable-next-line no-console
    console.log('==create-socket', userName, socket.readyState);

    this.connections.set(userName, socket);
  }

  remove(userName) {
    this.connections.delete(userName);
  }

  removeBySocket(ws) {
    for (const [userName, socket] of this.connections.entries()) {
      if (socket === ws) {
        this.connections.delete(userName);

        // eslint-disable-next-line no-console
        console.log('==removeBySocket', this.connections.has(userName));
        break;
      }
    }
  }

  sendToUsers(userNames, message) {
    const messageInString = JSON.stringify(message);

    for (const name of userNames) {
      const socket = this.connections.get(name);

      // eslint-disable-next-line no-console
      console.log('==sendToUsers', name, socket.readyState, messageInString);

      if (socket) {
        socket.send(messageInString);
      }
    }
  }
}

const sockets = new SocketManager();

module.exports = { sockets };
