export type User = {
  id: string;
  username: string;
  colorHuePercent: number;
  accessToken: string;
};

export type NormalizedUser = Omit<User, 'accessToken'>;

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  usersId: string[];
};

export interface Message {
  id: string;
  username: string;
  userId: string;
  roomId: string;
  time: Date;
  text: string;
}
