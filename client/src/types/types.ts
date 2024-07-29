export type Room = {
  id: number;
  userId: number;
  name: string;
};

export type Message = {
  id: number;
  userId: number;
  roomId: number;
  messageText: string;
  createdAt: string;
}
