import { Message } from '../models/index.js';

export const messageService = {
  getMessagesByRoomId: async (roomId: number) => {
    return await Message.findAll({ where: { roomId }});
  },

  createMessage: async (
    messageObj: {
      roomId: number,
      text: string,
      author: string
    }
  ) => {
    return await Message.create(messageObj);
  },

};
