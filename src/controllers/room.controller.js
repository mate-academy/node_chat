import { roomService } from '../services/room.service.js';

const getAll = async (req, res) => {
  const rooms = await roomService.getAll();

  res.send(rooms);
};

const add = async (req, res) => {
  try {
    const newRoom = await roomService.add(req.body);
    res.status(201).send(newRoom);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const rename = async (req, res) => {
  try {
    const renamedRoom = await roomService.rename(req.body.name, req.params.id);
    if (!renamedRoom) {
      return res.status(404).send({ error: 'Room not found' });
    }
    res.status(200).send(renamedRoom);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await roomService.deleteRoom(id);
    if (deleted) {
      res.status(200).send({ message: 'Room deleted successfully' });
    } else {
      res.status(404).send({ error: 'Room not found' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const rooms = await roomService.getAll();
    const room = rooms.find(r => r.id === parseInt(id));
    
    if (!room) {
      return res.status(404).send({ error: 'Room not found' });
    }
    
    res.status(200).send({ 
      message: 'Successfully joined room',
      room: room 
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const roomController = {
  getAll,
  add,
  rename,
  deleteRoom,
  joinRoom,
};
