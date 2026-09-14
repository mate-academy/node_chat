import { GENERAL } from './index.js';
import { Message } from './types/Message.js';
import { Room, Rooms } from './types/Room.js';

export type RoomMessages = { title: Room; messages: Message[] };
class ChatRooms {
  private _rooms: RoomMessages[] = [];
  private _titles: Rooms = [];

  constructor() {
    this._rooms = [
      {
        title: GENERAL,
        messages: [],
      },
    ];

    this._titles = this._rooms.map((room) => room.title);
  }

  get titles() {
    return this._titles;
  }

  get messages(): RoomMessages[] {
    return this._rooms;
  }

  public userMessages(userRooms: Rooms): RoomMessages[] {
    return this._rooms.filter(
      (room) => room.title === GENERAL || userRooms.includes(room.title),
    );
  }

  public addRoom(title: string): boolean {
    if (title === '' || this._titles.includes(title)) {
      return false;
    } else {
      this._titles.push(title);

      this._rooms.push({
        title,
        messages: [],
      });
    }

    return true;
  }

  public deleteRoom(title: string): boolean {
    if (title !== GENERAL && this._titles.includes(title)) {
      this._titles = this._titles.filter((curr) => curr !== title);
      this._rooms = this._rooms.filter((curr) => curr.title !== title);

      return true;
    }

    return false;
  }

  public renameRoom(currentTitle: string, newTitle: string): boolean {
    if (
      newTitle.trim() === '' ||
      currentTitle === GENERAL ||
      newTitle === GENERAL ||
      !this._titles.includes(currentTitle)
    ) {
      return false;
    }

    this._titles = this._titles.map((curr) => {
      return curr === currentTitle ? newTitle : curr;
    });

    this._rooms = this._rooms.map((currentRoom) => {
      return currentRoom.title === currentTitle
        ? { title: newTitle, messages: currentRoom.messages }
        : currentRoom;
    });

    return true;
  }

  public addMessage(title: Room, message: Message) {
    if (!this._titles.includes(title)) {
      return false;
    }

    if (message.author.trim() === '' || message.text.trim() === '') {
      return false;
    }

    const roomMessages = this._rooms.find(
      (currentRoom) => currentRoom.title === title,
    );

    if (!roomMessages) {
      return false;
    }

    roomMessages.messages.push(message);

    return true;
  }
}

export default ChatRooms;
