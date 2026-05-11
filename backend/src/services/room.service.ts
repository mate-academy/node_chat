import { Room } from '../models/index.js';

export const roomService = {
  getAllRooms: async () => {
    return await Room.findAll();
  },

  createRoom: async (roomName: string, owner: string) => {
    return await Room.create({ name: roomName, owner});
  },

  deleteRoom: async (roomId: number) => {
    return await Room.destroy({ where: { id: roomId }});
  },

  renameRoom: async (data: {newName: string, roomId: number}) => {
    return await Room.update(
      { name: data.newName },
      { where: { id: data.roomId }}
    );
  }

};
