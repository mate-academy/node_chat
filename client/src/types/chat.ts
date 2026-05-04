type Message = {
  id: number;
  text: string;
  author: string;
  timestamp: string;
  roomId: string;
};

type Room = {
  id: string;
  name: string;
};

export type { Message, Room };
