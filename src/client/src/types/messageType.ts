export type Message = {
  _id: string;
  roomId: string;
  authorId: { _id: string; name: string };
  text: string;
  time: string;
};
