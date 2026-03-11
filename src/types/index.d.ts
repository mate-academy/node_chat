interface ErrorMessage {
  for?: string;
  message: string;
}
interface ErrorObject {
  errors: ErrorMessage[];
}

type RawMessage = {
  author: string;
  text: string;
  roomId?: string;
};

type Message = {
  id: string;
  author: string;
  roomId?: string;
  text: string;
  createdAt: string;
};

type Room = {
  id: string;
  title: string;
};

type RawRoom = Pick<Room, 'title'>

type PartialRawRoom = Partial<RawRoom>;


type Update = {
  type: 'new' | 'update' | 'delete';
  to: 'rooms' | 'messages';
  data: Room | Message;
}
