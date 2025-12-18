import { Rooms } from "../models/rooms.js";
import { User } from "../models/user.js";
import { roomService } from "../service/room.service.js";


const getAll = async (req, res) => {
  const rooms = await roomService.getAllRooms()

  res.send(rooms)
}
const create = async (req, res) => {
  const { roomName, userId } = req.body;
  if (!roomName || !userId) {
    res.send({ message: 'bad request' })
    return
  }
  const findUser = await User.findOne({ where: { id: userId } })
  if (!findUser) {
    res.send({ message: 'unauthorization' })
    return
}
  const newRoom = await roomService.createRoom(roomName, findUser.id)
  const io = req.app.get('io');
  io.emit('room:created', newRoom);
  console.log(req.body)
  res.send(newRoom)
}

const renameRoom = async (req, res) => {
  const { roomId } = req.params
  const { newName,userId } = req.body
  if (!roomId || !newName) {
    res.send({message:'bad request'})
    return
  }
  const findRoom = await Rooms.findOne({ where: { id: roomId } })
  if (!findRoom) {
    res.send({ message: 'Room not find' })
    return
  }
  if (findRoom.userId !== userId) {
    res.send({message:'user not find'})
  return
}
   findRoom.name = newName;
  await findRoom.save()
console.log('Renaming room', roomId, 'to', newName);
const io = req.app.get('io');

io.emit('roomRenamed', { id: Number(roomId), name: newName });

  res.sendStatus(200)

}
const deleteRoom = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.query;

  const room = await Rooms.findOne({
    where: { id: Number(roomId) }
  });

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.userId !== Number(userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await room.destroy();

  const io = req.app.get('io');
  io.emit('roomDeleted', { id: Number(roomId) });

  return res.sendStatus(200);
};

export const roomControler = { create, getAll, renameRoom, deleteRoom}
