export type User = { id: string; username: string, colorHuePercent: number };

export interface Message {
  id: string;
  username: string;
  userId: string;
  time: Date;
  text: string;
}

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  usersId: string[];
  messagesId: string[];
};





