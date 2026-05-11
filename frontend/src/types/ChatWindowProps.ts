interface Room {
  id: number;
  name: string;
  owner: string;
}

export interface Message {
  id: number;
  roomId: number;
  text: string;
  author: string;
  createdAt: string;
}

export interface ChatWindowProps {
  setActiveRoom: (room: Room | null) => void,
  setNewMessageText: (text: string) => void,
  handleSendMessage: (newMessageText: string) => void,
  activeRoom: Room | null,
  messages: Message[],
  newMessageText: string,
  username: string;
}
