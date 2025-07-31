import { v4 as uuidv4 } from 'uuid';

export class RoomManager {
  constructor() {
    this.rooms = {}; // roomId => { id, name, messages[], clients: Set }
  }

  createRoom(name) {
    const id = uuidv4();

    this.rooms[id] = {
      id,
      name,
      messages: [],
      clients: new Set(),
    };

    return this.rooms[id];
  }

  renameRoom(id, name) {
    if (this.rooms[id]) {
      this.rooms[id].name = name;
    }
  }

  deleteRoom(id) {
    if (this.rooms[id]) {
      for (const client of this.rooms[id].clients) {
        client.close();
      }
      delete this.rooms[id];
    }
  }

  getRooms() {
    return Object.values(this.rooms);
  }

  getRoom(id) {
    return this.rooms[id];
  }

  addClient(id, ws) {
    this.rooms[id]?.clients.add(ws);
  }

  removeClient(id, ws) {
    this.rooms[id]?.clients.delete(ws);
  }

  addMessage(id, msg) {
    this.rooms[id]?.messages.push(msg);
  }

  broadcast(id, data) {
    const str = JSON.stringify(data);

    for (const client of this.rooms[id]?.clients || []) {
      client.send(str);
    }
  }
}
