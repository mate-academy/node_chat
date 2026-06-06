type SocketMessages = {
  SET_USERNAME: {
    username: string;
  };

  CREATE_ROOM: {
    roomName: string;
    creatorId: number;
  };

  JOIN_ROOM: {
    roomId: number;
  };

  RENAME_ROOM: {
    roomId: number;
    newName: string;
    userId: number;
  };

  DELETE_ROOM: {
    roomId: number;
    userId: number;
  };

  SEND_MESSAGE: {
    roomId: number;
    text: string;
  };
};

export function createSocketMessage<T extends keyof SocketMessages>(
  type: T,
  payload: SocketMessages[T],
): string {
  return JSON.stringify({
    type,
    payload,
  });
}
