type Message = {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface Room {
  name: string;
  messages: Message[];
}

export enum ActionType {
  GET_ROOMS = 'GET_ROOMS',
  CREATE_ROOM = 'CREATE_ROOM',
  ADD_MESSAGE = 'ADD_MESSAGE',
  DELETE_ROOM ='DELETE_ROOM',
  RENAME_ROOM = 'RENAME_ROOM',
}
