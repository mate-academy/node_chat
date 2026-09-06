export interface Message {
  username: string,
  time: Date | string,
  id: string,
  text: string,
  roomId: string;
}
