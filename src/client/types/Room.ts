export type RoomWithUsersList = {
  users: {
    id: number;
    username: string;
  }[];
} & {
  id: string;
  name: string;
};

export type RoomFullInform = {
  users: {
    id: number;
    username: string;
  }[];
  messages: ({
    author: {
      id: number;
      username: string;
    };
  } & {
    id: number;
    text: string;
    createdAt: Date;
    userId: number;
    roomId: string;
  })[];
} & {
  name: string;
  id: string;
};
