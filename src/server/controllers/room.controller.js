const { roomService } = require('../services/room.service');

const roomController = {
  createRoom: async (req, res) => {
    try {
      const { nameRoom } = req.body;
      const room = await roomService.createRoom(nameRoom);

      return res.status(201).json(room);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  updateRoom: async (req, res) => {
    try {
      const { roomId, newName } = req.body;
      const room = await roomService.renameRoom(roomId, newName);

      return res.status(200).json(room);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

  deleteRoom: async (req, res) => {
    try {
      const { roomId } = req.params;

      await roomService.deleteRoom(roomId);

      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

  getRooms: async (req, res) => {
    try {
      const rooms = await roomService.getRooms();

      return res.status(200).json(rooms);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  addUserToRoom: async (req, res) => {
    try {
      const { roomId, userId } = req.body;

      const room = await roomService.addUser(roomId, userId);

      return res.status(200).json(room);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },
};

module.exports = {
  roomController,
};
