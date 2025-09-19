import { roomService } from '../services/room.service.js';

export const isUserInRoom = async (req, res, next) => {
  const user = req.user;
  const { roomId } = req.params;
  const usersRooms = await roomService.findRoomsByUserId(user.id);

  const room = usersRooms.find((r) => r.id === parseInt(roomId, 10));

  if (!room) {
    return res
      .status(401)
      .json({ error: 'Користувач не має доступа до кімнати' });
  }

  req.room = room;

  next();
};
