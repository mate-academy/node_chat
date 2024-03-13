export type Message = {
  text: string,
  author: string,
  createdAt: string,
};

export type MessageSend = {
  text: string,
  author: string,
  roomId: string,
};

export enum MessageAction {
  CREATE_MESSAGE = 'CREATE_MESSAGE',
  CREATE_ROOM = 'CREATE_ROOM',
  DELETE_ROOM = 'DELETE_ROOM',
  RENAME_ROOM = 'RENAME_ROOM',
  UPDATE_ROOMS = 'UPDATE_ROOMS',
  ENTER_THE_ROOM = 'ENTER_THE_ROOM',
  LEAVE_THE_ROOM = 'LEAVE_THE_ROOM',
};
