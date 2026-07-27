export interface Message {
  id: string;
  userId: string;
  roomId: string;
  message: string;
  username: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
