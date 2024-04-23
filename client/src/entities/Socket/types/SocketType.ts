type SocketState = {
  usersOnline: SocketUser[]
};

type SocketUser = {
  userId: number,
  socketId: string,
}

export type {
  SocketState,
}