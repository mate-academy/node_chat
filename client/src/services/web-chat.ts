import $api from '../http';

export default class Chat {
  static async registration(name: string) {
    return $api.post('/register', { name });
  }

  static async getRooms() {
    return $api.get('/room');
  }

  static async createRoom(name: string) {
    return $api.post('/create-room', { name });
  }

  static async removeRoom(id: string) {
    return $api.delete(`/room/${id}`);
  }

  static async renameRoom(name: string, id: string) {
    return $api.patch(`/room/${id}`, { name });
  }

  static async getMessage(id: string) {
    return $api.get(`/message`, {
      params: {
        id,
      },
    });
  }

  static async createMessage(text: string, author: string, roomId: string) {
    return $api.post('/message', { text, author, roomId });
  }
}
