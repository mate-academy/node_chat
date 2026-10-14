export type SocketMessage = {
  SET_USERNAME: {
    userName: string;
  };
  CREATE_ROOM: {
    roomName: string;
    creatorId: string;
  };
  JOIN_ROOM: {
    roomId: string;
  };
  SEND_MESSAGE: {
    roomId: string;
    text: string;
  };
  NEWNAME_ROOM: {
    roomId: string;
    userId: string;
    newName: string;
  };
  DELETE_ROOM: {
    roomId: string;
    userId: string;
  };
};
