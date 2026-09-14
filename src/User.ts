import { Room } from './types/Room.js';

class User {
  id: string;
  userName: string;
  private _rooms: string[] = [];

  constructor(id: string, userName: string) {
    this.id = id;
    this.userName = userName;
  }

  get rooms() {
    return this._rooms;
  }

  public addRoom(room: Room): void {
    if (!this._rooms.includes(room)) {
      this._rooms.push(room);
    }
  }

  public removeRoom(room: Room): void {
    this._rooms = this._rooms.filter((currentRoom) => currentRoom !== room);
  }
}

export default User;
