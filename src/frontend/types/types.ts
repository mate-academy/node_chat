export type User = {
  id: number,
  username: string,
}

export type Message = {
  author: string,
  text: string,
  time: string,
  roomId: string,
}

export type Room = {
  id: string,
  name: string,
}
