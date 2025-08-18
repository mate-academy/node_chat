import { roomsApi } from '../api/roomsApi.js';

const getRooms = async (req, res) => {
  const rooms = await roomsApi.getAllRooms();

  res.status(200).json(rooms);
};

const createRoom = (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ message: "Can't create room." });

    return;
  }

  const id = crypto.randomUUID();
  const newRoom = {
    name,
    id,
  };

  roomsApi.saveRoom(newRoom);
  res.status(201).json(newRoom);
};

const updateRoom = (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name || !id) {
    res.status(400).json({ message: "Can't create room." });

    return;
  }

  const updatedRoom = {
    name,
    id,
  };

  roomsApi.saveRoom(updatedRoom);
  res.status(201).json(updatedRoom);
};

const deleteRoom = (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "Room doen't exist!" });

    return;
  }

  roomsApi.deleteRoom(id, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting room' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  });
};

const getRoom = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "Room doen't exist!" });

    return;
  }

  const room = await roomsApi.getRoomById(id);

  res.status(200).json(room);
};

export const roomsController = {
  getRooms,
  createRoom,
  deleteRoom,
  updateRoom,
  getRoom,
};
