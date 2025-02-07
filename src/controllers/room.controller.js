import roomModel from '../models/room.model.js';
import SocketService from '../services/socket.service.js';

const getRooms = async (_req, res) => {
  try {
    const rooms = await roomModel.find().exec();

    res.json(rooms);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const room = await roomModel.create({
      name,
      owner: req.user.username,
    });

    const io = SocketService.getInstance().getSocket();

    io.emit('message', {
      type: 'create-room',
      payload: {
        id: room._id,
        name: room.name,
        owner: room.owner,
      },
    });

    res.json(room);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await roomModel.findById(id).exec();

    if (!room) {
      res.status(404).send('Room not found');

      return;
    }

    if (room.owner !== req.user.username) {
      res.status(403).send('Forbidden');

      return;
    }

    await roomModel.findByIdAndDelete(id).exec();

    const io = SocketService.getInstance().getSocket();

    io.emit('message', {
      type: 'delte-room',
      payload: {
        id: room._id,
      },
    });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

const renameRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const room = await roomModel.findById(id).exec();

    if (!room) {
      res.status(404).send('Room not found');

      return;
    }

    if (room.owner !== req.user.username) {
      res.status(403).send('Forbidden');

      return;
    }

    room.name = name;
    await room.save();

    const io = SocketService.getInstance().getSocket();

    io.emit('message', {
      type: 'rename-room',
      payload: {
        id: room._id,
        name: room.name,
      },
    });

    res.json(room);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

export default {
  getRooms,
  createRoom,
  deleteRoom,
  renameRoom,
};
