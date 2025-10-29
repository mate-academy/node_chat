import { UserRoom } from '../models/index.js';

const createUserRoom = async (roomId, userId) => {
  const newUserRoom = await UserRoom.create({ roomId, userId });

  return newUserRoom;
};

export const userRoomService = {
  createUserRoom,
};
